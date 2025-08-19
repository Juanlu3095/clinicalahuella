import { Component, inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/api/analytics.service';
import { Analyticsdata } from '../../interfaces/analyticsdata';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, MatTableModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent implements OnInit{

  public title = inject(Title)
  public analyticsService = inject(AnalyticsService)
  dataByPageurl: Analyticsdata[] = []
  dataByCity: Analyticsdata[] = []
  dataByDevices: Analyticsdata[] = []
  displayedColumns: string[] = ['dimension', 'value']

  ngOnInit(): void {
    this.title.setTitle('Panel de control < Clínica veterinaria La Huella')
    this.getPageUrslData()
    this.getCitiesData()
    this.getDevicesData()
  }

  getPageUrslData () {
    this.analyticsService.getPageUrlData().subscribe({
      next: (respuesta) => {
        this.dataByPageurl = respuesta.data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  getCitiesData () {
    this.analyticsService.getCitiesData().subscribe({
      next: (respuesta) => {
        this.dataByCity = respuesta.data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  getDevicesData () {
    this.analyticsService.getDevicesData().subscribe({
      next: (respuesta) => {
        this.dataByDevices = respuesta.data
      },
      error: (error) => {
        console.error(error)
      }
    })
  }
}
