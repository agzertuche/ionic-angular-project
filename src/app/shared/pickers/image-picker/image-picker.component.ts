import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Input,
} from '@angular/core';
import {
  Capacitor,
  Plugins,
  CameraSource,
  CameraResultType,
} from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @ViewChild('filePicker') filePicker: ElementRef<HTMLInputElement>;
  @Output() imagePick = new EventEmitter<string | File>();
  @Input() showPreview = false;

  selectedImage: string;
  usePicker = false;

  constructor(private platforn: Platform) {}

  ngOnInit() {
    if (
      (this.platforn.is('mobile') && !this.platforn.is('hybrid')) ||
      this.platforn.is('desktop')
    ) {
      this.usePicker = true;
    }
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    };

    reader.readAsDataURL(pickedFile);
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }

    Plugins.Camera.getPhoto({
      quality: 50,
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.Base64,
    })
      .then(image => {
        this.selectedImage = image.base64String;
        this.imagePick.emit(image.base64String);
      })
      .catch(err => {
        console.error(err);
        if (this.usePicker) {
          this.filePicker.nativeElement.click();
        }
        return false;
      });
  }
}
