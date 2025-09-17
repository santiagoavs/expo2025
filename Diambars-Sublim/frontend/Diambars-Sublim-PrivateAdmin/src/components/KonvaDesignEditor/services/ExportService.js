// services/ExportService.js
import jsPDF from 'jspdf';

export class ExportService {
  async exportStage(stage, options = {}) {
    try {
      const {
        format = 'png',
        quality = 1,
        pixelRatio = 2,
        includeBackground = true,
        width,
        height
      } = options;

      const dataURL = stage.toDataURL({
        mimeType: `image/${format}`,
        quality,
        pixelRatio,
        width,
        height
      });

      if (format === 'pdf') {
        return this.exportAsPDF(stage, options);
      }

      // Descargar imagen
      this.downloadFile(dataURL, `design.${format}`);

      return {
        success: true,
        dataURL,
        format
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async exportAsPDF(stage, options = {}) {
    const {
      orientation = 'landscape',
      format = 'a4',
      quality = 1
    } = options;

    const dataURL = stage.toDataURL({
      mimeType: 'image/png',
      quality,
      pixelRatio: 2
    });

    const pdf = new jsPDF({
      orientation,
      unit: 'px',
      format: format === 'a4' ? [595, 842] : [stage.width(), stage.height()]
    });

    const imgProps = pdf.getImageProperties(dataURL);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;
    const marginX = (pdfWidth - imgWidth) / 2;
    const marginY = (pdfHeight - imgHeight) / 2;

    pdf.addImage(dataURL, 'PNG', marginX, marginY, imgWidth, imgHeight);
    pdf.save('design.pdf');

    return {
      success: true,
      format: 'pdf'
    };
  }

  downloadFile(dataURL, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
