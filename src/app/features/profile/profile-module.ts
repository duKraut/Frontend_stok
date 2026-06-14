import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ProfileRoutingModule } from './profile-routing-module';
import { ProfileHome } from './pages/profile-home/profile-home';

@NgModule({
  declarations: [ProfileHome],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule {}
