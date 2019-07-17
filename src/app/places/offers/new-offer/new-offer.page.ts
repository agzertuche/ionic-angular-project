import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PlacesService } from '../../services/places.service';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { PlaceLocation } from '../../services/location.model';
import { switchMap } from 'rxjs/operators';

function base64toBlob(base64Data: any, contentType: any) {
  contentType = contentType || '';
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}

@Component({
  selector: 'app-new-offer',
  templateUrl: './new-offer.page.html',
  styleUrls: ['./new-offer.page.scss'],
})
export class NewOfferPage implements OnInit {
  form: FormGroup;

  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required],
      }),
      location: new FormControl(null, {
        validators: [Validators.required],
      }),
      image: new FormControl(null),
    });
  }

  onLocationPicked(location: PlaceLocation) {
    this.form.patchValue({ location });
  }

  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        imageFile = base64toBlob(
          imageData.replace('data:image/jpeg;base64,', ''),
          'image/jpeg',
        );
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      imageFile = imageData;
    }

    this.form.patchValue({ image: imageFile });
  }

  onCreateOffer() {
    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }

    this.loadingCtrl
      .create({
        message: 'Crating place...',
      })
      .then(loadingElem => {
        loadingElem.present();
        this.placesService
          .uploadImage(this.form.get('image').value)
          .pipe(
            switchMap(uploadResponse => {
              const {
                title,
                description,
                price,
                dateFrom,
                dateTo,
                location,
              } = this.form.value;

              return this.placesService.addPlace({
                id: undefined,
                title,
                description,
                imageUrl: uploadResponse.imageUrl,
                price: +price,
                availableFrom: new Date(dateFrom),
                availableTo: new Date(dateTo),
                userId: undefined,
                location,
              });
            }),
          )
          .subscribe(() => {
            loadingElem.dismiss();
            this.form.reset();
            this.router.navigate(['places/tabs/offers']);
          });
      });
  }
}
