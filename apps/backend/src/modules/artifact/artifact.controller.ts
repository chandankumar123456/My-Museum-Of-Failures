import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArtifactService } from './artifact.service';
import { ArtifactType } from '@prisma/client';

@Controller('artifacts')
export class ArtifactController {
  constructor(private readonly artifactService: ArtifactService) {}

  @Post('upload/:exhibitId/:type')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('exhibitId') exhibitId: string,
    @Param('type') type: ArtifactType,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.artifactService.uploadArtifact(exhibitId, file, type);
  }

  @Get(':id/url')
  getUrl(@Param('id') id: string) {
    return this.artifactService.getArtifactUrl(id);
  }

  @Get('exhibit/:exhibitId')
  getExhibitArtifacts(@Param('exhibitId') exhibitId: string) {
    return this.artifactService.getExhibitArtifacts(exhibitId);
  }
}
