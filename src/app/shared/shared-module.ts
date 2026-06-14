import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchableSelect } from './components/searchable-select/searchable-select';

@NgModule({
  declarations: [SearchableSelect],
  imports: [CommonModule],
  exports: [SearchableSelect],
})
export class SharedModule {}
