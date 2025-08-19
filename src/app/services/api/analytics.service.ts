import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ApiresponsePartial } from '../../interfaces/apiresponse';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private readonly http = inject(HttpClient)
  private readonly endpoint = environment.apiendpoint

  constructor() { }

  getPageUrlData () {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/analytics/pageurl`, { withCredentials: true })
  }

  getCountriesData () {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/analytics/country`, { withCredentials: true })
  }

  getCitiesData () {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/analytics/city`, { withCredentials: true })
  }

  getDevicesData () {
    return this.http.get<ApiresponsePartial>(`${this.endpoint}/analytics/device`, { withCredentials: true })
  }
}
