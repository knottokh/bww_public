import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appMyDragDrop]'
})
export class MyDragDropDirective {

  // tslint:disable-next-line: no-output-on-prefix
  @Input() multiple: boolean;
  @Output() onFileDropped = new EventEmitter<any>();

  @HostBinding('style.background-color') private background = '#f5fcff';
  @HostBinding('style.opacity') private opacity = '1';

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#9ecbec';
    this.opacity = '0.8';
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#f5fcff';
    this.opacity = '1';
    const files = evt.dataTransfer.files;
    // console.log(files);
    if (files.length > 0) {
      if (this.multiple) {
        this.onFileDropped.emit(files);
      } else {
        const file1 = [files[0]];
        this.onFileDropped.emit(file1);
      }
    }
  }

}
