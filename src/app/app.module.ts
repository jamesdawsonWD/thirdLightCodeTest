import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTPservice } from './services/http.service';
import { SideNavigationComponent } from './views/side-navigation/side-navigation.component';
import { StoreService } from './services/store.service';

@NgModule({
  declarations:   [AppComponent, SideNavigationComponent],
  imports:        [BrowserModule, AppRoutingModule, HttpClientModule],
  providers:      [HTTPservice, StoreService],
  bootstrap:      [AppComponent]
})
export class AppModule {}
