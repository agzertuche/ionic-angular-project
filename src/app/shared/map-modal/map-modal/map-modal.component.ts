import {
  Component,
  OnInit,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Renderer2,
  OnDestroy,
  Input,
} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('map') mapElementRef: ElementRef;
  @Input() center = { lat: 25.6866142, lng: -100.3161126 }; // Monterrey location
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;

  constructor(
    private modalCtrl: ModalController,
    private renderer: Renderer2,
  ) {}

  ngOnInit() {}

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  ngAfterViewInit() {
    this.getGoogleMaps()
      .then((googleMaps: any) => {
        this.googleMaps = googleMaps;
        const mapElement = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapElement, {
          center: this.center,
          zoom: 12,
        });

        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapElement, 'visible');
        });

        if (this.selectable) {
          this.clickListener = map.addListener('click', event => {
            const selectedCoords = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng(),
            };

            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map,
            title: 'Picked Location',
          });
          marker.setMap(map);
        }
      })
      .catch(err => {
        console.error(err.message);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  private getGoogleMaps() {
    const win = window as any;
    const googleModule = win.google;

    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        environment.googleMapsAPIKey
      }`;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject(new Error('Google maps SDK not available.'));
        }
      };
    });
  }
}
