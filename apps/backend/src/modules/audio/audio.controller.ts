import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AudioService } from './audio.service';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post(':exhibitId')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('exhibitId') exhibitId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 25 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^audio\/.+$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.audioService.upload(exhibitId, file);
  }

  @Get(':exhibitId')
  get(@Param('exhibitId') exhibitId: string) {
    return this.audioService.get(exhibitId);
  }

  @Post(':exhibitId/process')
  @Throttle({ default: { ttl: 5 * 60_000, limit: 3 } })
  process(@Param('exhibitId') exhibitId: string) {
    return this.audioService.process(exhibitId);
  }

  @Delete(':exhibitId')
  remove(@Param('exhibitId') exhibitId: string) {
    return this.audioService.remove(exhibitId);
  }
}
