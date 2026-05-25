import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArtifactService } from './artifact.service';
import { ArtifactType } from '@prisma/client';

/**
 * Per-type accepted MIME prefixes. Anything that doesn't match is
 * rejected before it touches R2.
 */
const TYPE_MIME_PATTERNS: Record<ArtifactType, RegExp> = {
  image: /^image\/(png|jpe?g|gif|webp|avif)$/,
  screenshot: /^image\/(png|jpe?g|webp)$/,
  audio: /^audio\/(mpeg|mp4|ogg|wav|webm)$/,
  pdf: /^application\/pdf$/,
  code: /^(text\/.+|application\/(json|xml|javascript|typescript))$/,
  note: /^(text\/.+|application\/json)$/,
};

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
          new FileTypeValidator({ fileType: /^(image|audio|application|text)\/.+$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const pattern = TYPE_MIME_PATTERNS[type];
    if (!pattern) {
      throw new BadRequestException(`Unsupported artifact type: ${type}`);
    }
    if (!pattern.test(file.mimetype)) {
      throw new BadRequestException(
        `MIME type ${file.mimetype} is not allowed for artifact type ${type}`,
      );
    }
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
