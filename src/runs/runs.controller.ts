import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateRunDto } from './dto/create-run.dto';
import { RunsService } from './runs.service';

@ApiTags('runs')
@Controller('experiments/:experimentId')
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Post('runs')
  create(
    @Param('experimentId', ParseIntPipe) experimentId: number,
    @Body() dto: CreateRunDto,
  ) {
    return this.runs.create(experimentId, dto);
  }

  @Get('runs')
  findAll(@Param('experimentId', ParseIntPipe) experimentId: number) {
    return this.runs.findAll(experimentId);
  }

  @Delete('runs/:runId')
  @HttpCode(204)
  async remove(
    @Param('experimentId', ParseIntPipe) experimentId: number,
    @Param('runId', ParseIntPipe) runId: number,
  ): Promise<void> {
    await this.runs.remove(experimentId, runId);
  }

  @Post('runs/import')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  importCsv(
    @Param('experimentId', ParseIntPipe) experimentId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Upload a CSV file in the "file" field');
    }
    return this.runs.importCsv(experimentId, file.buffer.toString('utf-8'));
  }

  @Get('runs/export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="runs.csv"')
  exportCsv(@Param('experimentId', ParseIntPipe) experimentId: number) {
    return this.runs.exportCsv(experimentId);
  }

  @Get('stats')
  stats(@Param('experimentId', ParseIntPipe) experimentId: number) {
    return this.runs.stats(experimentId);
  }
}
