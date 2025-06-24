import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.component.html',
  styleUrls: ['./time-sheet.component.css']
})
export class TimeSheetComponent implements OnInit {
  startDate: string = '';
  endDate: string = '';
  idFilter: string = '';
  statusFilter: string = '';
  currentTime: string = '';

  timesheetEntries = [
    {
      status: 'Approved',
      id: 'VISATS0084620',
      revision: '-',
      mainDoc1: 'Infosys | FY25 ...',
      mainDoc2: 'Vhol, Jaymis...',
      supervisor: 'Vhol, Jaymis...',
      startDate: '28/04/2025',
      endDate: '04/05/2025',
      st: 35.2,
      ot: 0,
      dt: 0,
      others: 0,
      nb: 0
    },
    // More entries as needed
  ];
  filteredEntries = [...this.timesheetEntries];


  constructor(private router: Router) { }

  applyFilters(): void {
    this.filteredEntries = this.timesheetEntries.filter(entry => {
      const matchesStatus = this.statusFilter === '' || entry.status === this.statusFilter;
      const matchesId = this.idFilter === '' || entry.id.toLowerCase().includes(this.idFilter.toLowerCase());

      const entryStart = this.parseDate(entry.startDate);
      const entryEnd = this.parseDate(entry.endDate);
      const filterStart = this.startDate ? new Date(this.startDate) : null;
      const filterEnd = this.endDate ? new Date(this.endDate) : null;

      const withinPeriod = (!filterStart || entryStart >= filterStart) &&
        (!filterEnd || entryEnd <= filterEnd);

      return matchesStatus && matchesId && withinPeriod;
    });

    this.currentPage = 1;
  }

  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/');
    return new Date(+year, +month - 1, +day);
  }


  refresh(): void {
    console.log('Data refreshed');
  }

  downloadListData(): void {
    console.log('List data downloaded');
  }

  clearSort(): void {
    console.log('Sort cleared');
  }

  clearFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.idFilter = '';
    this.statusFilter = '';
    console.log('Filters cleared');
  }
  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 9;

  // Getter to compute paginated data
  get paginatedFilteredEntries() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredEntries.slice(start, start + this.itemsPerPage);
  }


  get totalPages(): number {
    return Math.ceil(this.filteredEntries.length / this.itemsPerPage);
  }

  getEndCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredEntries.length);
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }



  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // updates every minute
  }

  updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


}
