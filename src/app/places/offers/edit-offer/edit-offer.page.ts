import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlacesService } from '../../services/places.service';
import { NavController } from '@ionic/angular';
import { Place } from '../../services/place.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit {
  place: Place;
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private placesService: PlacesService,
    private navCtrl: NavController,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      const placeId = paramMap.get('placeId');
      if (!placeId) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }
      this.place = this.placesService.getPlace(placeId);
      this.form = new FormGroup({
        title: new FormControl(this.place.title, {
          updateOn: 'blur',
          validators: [Validators.required],
        }),
        description: new FormControl(this.place.description, {
          updateOn: 'blur',
          validators: [Validators.required, Validators.maxLength(180)],
        }),
      });
    });
  }

  onOfferUpdated() {
    if (!this.form.valid) {
      return;
    }
    console.log(this.form);
  }
}
