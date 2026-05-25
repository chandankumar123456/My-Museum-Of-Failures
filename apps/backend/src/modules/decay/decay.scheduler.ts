import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ExhibitService } from '../exhibit/exhibit.service';
import { ArtifactService } from '../artifact/artifact.service';

/**
 * Background scheduler that ages the museum.
 *
 * Memory in this museum is treated as a physical thing — it fades, it
 * dusts, it cracks. This service runs once a day and updates the visual
 * decay state of old exhibits and their artifacts.
 *
 * Cron expression: every day at 03:17 server time (an off-peak slot to
 * avoid clashing with backups or analytics jobs).
 */
@Injectable()
export class DecayScheduler {
  private readonly logger = new Logger(DecayScheduler.name);

  constructor(
    private readonly exhibits: ExhibitService,
    private readonly artifacts: ArtifactService,
  ) {}

  @Cron('17 3 * * *', { name: 'decay-nightly' })
  async runNightlyDecay() {
    this.logger.log('Running nightly decay sweep');
    try {
      await this.exhibits.updateDecayLevels();
      const result = await this.artifacts.decayOldArtifacts();
      this.logger.log(
        `Decay sweep complete. Artifacts marked decayed: ${result?.count ?? 0}`,
      );
    } catch (err) {
      this.logger.error('Decay sweep failed', err as Error);
    }
  }

  /**
   * Light, hourly housekeeping: only touches exhibits that just crossed
   * a decay threshold (cheap query). Useful in production but disabled
   * during local development to keep logs quiet.
   */
  @Cron(CronExpression.EVERY_HOUR, { name: 'decay-hourly' })
  async runHourlyTouchup() {
    if (process.env.NODE_ENV !== 'production') return;
    try {
      await this.exhibits.updateDecayLevels();
    } catch (err) {
      this.logger.warn('Hourly decay touchup failed', err as Error);
    }
  }
}
