declare module 'pdf2json' {
    import { EventEmitter } from 'events';

    class PDFParser extends EventEmitter {
        constructor();
        
        loadPDF(pdfFilePath: string): void;
    }

    export = PDFParser;
}
