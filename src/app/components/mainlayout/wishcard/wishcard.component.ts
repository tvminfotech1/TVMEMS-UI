import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from 'src/app/services/employee.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-wishcard',
  templateUrl: './wishcard.component.html',
  styleUrls: ['./wishcard.component.css']
})
export class WishcardComponent implements OnInit {
  //  Define category constants
  readonly CATEGORY_ONBOARDING = 'Onboarded';//'WELCOME ON BOARD';
  readonly CATEGORY_BIRTHDAY = 'BirthDay';//'BIRTHDAY WISHES';
  readonly CATEGORY_ANNIVERSARY = 'Anniversary';//'ANNIVERSARY WISHES';

  allWishes: any[] = [];
  today = new Date();

  onboardingWishes: any[] = [];
  birthdayWishes: any[] = [];
  anniversaryWishes: any[] = [];

useDummyData = false;  //dummy data enabled true

@ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

visibleStart: any = {
  [this.CATEGORY_ONBOARDING]: 0,
  [this.CATEGORY_BIRTHDAY]: 0,
  [this.CATEGORY_ANNIVERSARY]: 0
};
  visibleCards: any[] = [];
currentIndex = 0;
startIndex = 0;
visibleCount = 3; // how many cards visible at once
currentIndexes: any = {
  Onboarded: 0,
  BirthDay: 0,
  Anniversary: 0
};
  autoScrollInterval: any;
  onboardingIndex = 0;
  birthdayIndex = 0;
  anniversaryIndex = 0;
  filteredWishes:any[]=[];

  constructor(private http: HttpClient,    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer) { }


  ngOnInit() {
  // if (this.useDummyData) {
  //   console.warn('⚙️ Using dummy data for testing...');
  //   this.loadDummyData();
  //   return;
  // }

  // First, try to load from backend
  this.http.get<any>('http://localhost:8080/personal/wishes').subscribe({
    next: data => {
      if (data && (data.BirthDay?.length || data.Onboarded?.length || data.Anniversary?.length)) {
        console.log('Loaded data from backend');
        this.prepareWishes(data);
      } else {
        console.warn('Backend returned empty, using dummy data...');
        // this.loadDummyData();
      }
    },
    error: err => {
      console.error('Error fetching wishes:', err);
      // this.loadDummyData();
    }
  });
}

  ngOnDestroy() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
    }
  }

// -------------------------------------------
// 🔹 Helper: Dummy data fallback
// -------------------------------------------
// loadDummyData() {
//   const backendData: any = {
//     BirthDay: [
//       { name: 'Priya', dob: '07 Nov', role: 'Software Engineer', pSizePhoto: null },
//       { name: 'Shina', dob: '10 Nov', role: 'Software Engineer', pSizePhoto: 'assets/userimg/OIP.jpg' },
//       { name: 'Ravi', date: '10 Nov', role: 'Developer', pSizePhoto: null }
//     ],
//     Anniversary: [
//       { name: 'Kumar', dob: '10 Nov', role: 'QA Lead', pSizePhoto: null }
//     ],
//     Onboarded: [
//       { name: 'Meena', joiningDate: '08 Nov', role: 'Admin', pSizePhoto: null },
//       { name: 'Raja', joiningDate: '09 Nov', role: 'Intern', pSizePhoto: null }
//     ]
//   };
//   this.prepareWishes(backendData);
// }

prepareWishes(backendData: any) {
  console.log('🎉 Raw wishes:', backendData);

  this.birthdayWishes = backendData.BirthDay || [];
  this.anniversaryWishes = backendData.Anniversary || [];
  this.onboardingWishes = backendData.Onboarded || [];

  this.allWishes = [
    ...this.birthdayWishes.map(p => ({
      ...p,
      category: this.CATEGORY_BIRTHDAY,
      date: p.dob 
        ? new Date(p.dob).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
        : (p.date || '')
    })),
    ...this.anniversaryWishes.map(p => ({
      ...p,
      category: this.CATEGORY_ANNIVERSARY,
      date: p.joiningDate 
        ? new Date(p.joiningDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
        : (p.date || '')
    })),
    ...this.onboardingWishes.map(p => ({
      ...p,
      category: this.CATEGORY_ONBOARDING,
      date: p.dob 
        ? new Date(p.dob).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
        : (p.date || '')
        
    }))
  ];

  // Debug (shows all mapped wishes before filtering)
  this.filteredWishes = this.allWishes;
  console.log('🔥 filteredWishes:', this.filteredWishes);
  console.log('Onboarding items:', this.onboardingWishes);
  console.log('Anniversary items:', this.anniversaryWishes);

  // Ensure default image if missing
  // this.allWishes.forEach(p => {
  //   if (!p.image && p.employeeId) {
  //     this.employeeService.getEmployeePhoto(p.employeeId).subscribe(blob => {
  //       const objectURL = URL.createObjectURL(blob);
  //       p.image = this.sanitizer.bypassSecurityTrustUrl(objectURL) as string;
  //     }, err => {
  //       console.error('Error fetching photo for', p.name, err);
  //       p.image = 'assets/userimg/OIP.jpg';
  //     });
  //   } else if (!p.image) {
  //     p.image = 'assets/userimg/OIP.jpg';
  //   }
  // });

  this.allWishes.forEach(p => {
  if (p.pSizePhoto) {
    // Case 1: backend returned a Base64 string
    if (p.pSizePhoto.startsWith('data:image')) {
      // already prefixed properly
      p.image = this.sanitizer.bypassSecurityTrustUrl(p.pSizePhoto);
    } else {
      // manually build data URI
      p.image = this.sanitizer.bypassSecurityTrustUrl(
        'data:image/jpeg;base64,' + p.pSizePhoto
      );
    }
  } else if (p.employeeId) {
    // Case 2: backend gives only ID → fetch blob
    this.employeeService.getEmployeePhoto(p.employeeId).subscribe({
      next: blob => {
        const objectURL = URL.createObjectURL(blob);
        p.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: err => {
        console.error('❌ Error loading photo for', p.name, err);
        p.image = 'assets/userimg/OIP.jpg';
      }
    });
  } else {
    // Case 3: fallback image
    p.image = 'assets/userimg/OIP.jpg';
  }
});

  console.log('✅ All wishes prepared:', this.allWishes);

  // Filter today's wishes
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-GB', { day:'2-digit', month:'short' });

  this.filteredWishes = this.allWishes.filter(p => p.date === todayStr);
  console.log('🎯 Filtered (today):', this.filteredWishes);
}


// prepareWishes(backendData: any) {
//   console.log('🎉 Raw wishes:', backendData);

//   this.birthdayWishes = backendData.BirthDay || [];
//   this.anniversaryWishes = backendData.Anniversary || [];
//   this.onboardingWishes = backendData.Onboarded || [];

//   this.allWishes = [
//     // ...this.birthdayWishes.map(p => ({ ...p, category: 'BirthDay', date: p.dob || p.date })),
//     // ...this.anniversaryWishes.map(p => ({ ...p, category: 'Anniversary', date: p.dob || p.date })),
//     // ...this.onboardingWishes.map(p => ({ ...p, category: 'Onboarded', date: p.joiningDate }))

//       ...this.birthdayWishes.map(p => ({ ...p, category: this.CATEGORY_BIRTHDAY, date: p.dob || p.date })),
//   ...this.anniversaryWishes.map(p => ({ ...p, category: this.CATEGORY_ANNIVERSARY, date: p.dob || p.date })),
//   ...this.onboardingWishes.map(p => ({ ...p, category: this.CATEGORY_ONBOARDING, date: p.joiningDate || p.date }))
//   ];

//   //for debug
//   this.filteredWishes = this.allWishes;
// console.log('🔥 filteredWishes:', this.filteredWishes);
//   console.log('Onboarding items:', this.onboardingWishes);
// console.log('Anniversary items:', this.anniversaryWishes);

//   // ✅ Ensure default image if missing
//   this.allWishes.forEach(p => {
//       if (!p.image && p.employeeId) {   // assuming you have employeeId
//         this.employeeService.getEmployeePhoto(p.employeeId).subscribe(blob => {
//           const objectURL = URL.createObjectURL(blob);
//           p.image = this.sanitizer.bypassSecurityTrustUrl(objectURL) as string;
//         }, err => {
//           console.error('Error fetching photo for', p.name, err);
//           p.image = 'assets/userimg/OIP.jpg';  // fallback image
//         });
//       } else if (!p.image) {
//         p.image = 'assets/userimg/OIP.jpg';
//       }
//     });

//   console.log('✅ All wishes prepared:', this.allWishes);

//   // ✅ Filter today's wishes
//   const today = new Date();
//   const todayStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

//   this.filteredWishes = this.allWishes.filter(p => p.date === todayStr);

//   console.log('🎯 Filtered (today):', this.filteredWishes);
// }


// prepareWishes(data: any) {
//   console.log('🎉 Raw wishes:', data);

//   this.birthdayWishes = data.BirthDay || [];
//   this.anniversaryWishes = data.Anniversary || [];
//   this.onboardingWishes = data.Onboarded || [];

//   // this.allWishes = [
//   //   ...this.birthdayWishes.map(p => ({
//   //     ...p,
//   //     category: this.CATEGORY_BIRTHDAY,
//   //     date: p.dob
//   //   })),
//   //   ...this.anniversaryWishes.map(p => ({
//   //     ...p,
//   //     category: this.CATEGORY_ANNIVERSARY,
//   //     date: p.dob
//   //   })),
//   //   ...this.onboardingWishes.map(p => ({
//   //     ...p,
//   //     category: this.CATEGORY_ONBOARDING,
//   //     date: p.joiningDate
//   //   }))
//   // ];

//   this.allWishes = [
//   ...this.birthdayWishes.map(p => ({ ...p, category: 'BirthDay', date: p.dob || p.date })),
//   ...this.anniversaryWishes.map(p => ({ ...p, category: 'Anniversary', date: p.dob || p.date })),
//   ...this.onboardingWishes.map(p => ({ ...p, category: 'Onboarded', date: p.joiningDate }))
// ];


//   this.allWishes.forEach(p => {
//   if (!p.image) p.image = p.pSizePhoto || 'assets/userimg/OIP.jpg';
//   });

//   this.filteredWishes = this.allWishes;
//   console.log('✅ All wishes prepared:', this.allWishes);
// }


// filterWishes() {
//   const todayDay = this.today.getDate();
//   const todayMonth = this.today.toLocaleString('default', { month: 'short' }).toLowerCase();
//   const todayFormatted = `${todayDay < 10 ? '0' + todayDay : todayDay} ${todayMonth.charAt(0).toUpperCase() + todayMonth.slice(1, 3)}`;

//   // 🔹 Onboarding wishes (max 10)
//   this.onboardingWishes = this.allWishes
//     // .filter(p => {
//     //   if (p.category !== this.CATEGORY_ONBOARDING || !p.date) return false;
//     //   const match = p.date.match(/(\d{1,2}) (\w{3})/);
//     //   if (!match) return false;
//     //   const day = parseInt(match[1]);
//     //   const month = match[2].toLowerCase();
//     //   return day === todayDay && month === todayMonth;
//     // })
//         .filter(p => p.category === this.CATEGORY_ONBOARDING && p.date === todayFormatted)

//     .slice(0, 10);

//   // 🔹 Birthday wishes (max 15)
//   this.birthdayWishes = this.allWishes
//     // .filter(p => {
//     //   if (p.category !== this.CATEGORY_BIRTHDAY || !p.date) return false;
//     //   const match = p.date.match(/(\d{1,2}) (\w{3})/);
//     //   if (!match) return false;
//     //   const day = parseInt(match[1]);
//     //   const month = match[2].toLowerCase();
//     //   return day === todayDay && month === todayMonth;
//     // })
//         .filter(p => p.category === this.CATEGORY_BIRTHDAY && p.date === todayFormatted)
//     .slice(0, 15);

//   // 🔹 Anniversary wishes (max 10)
//   this.anniversaryWishes = this.allWishes
//     // .filter(p => {
//     //   if (p.category !== this.CATEGORY_ANNIVERSARY || !p.date) return false;
//     //   const match = p.date.match(/(\d{1,2}) (\w{3})/);
//     //   if (!match) return false;
//     //   const day = parseInt(match[1]);
//     //   const month = match[2].toLowerCase();
//     //   return day === todayDay && month === todayMonth;
//     // })
//         .filter(p => p.category === this.CATEGORY_ANNIVERSARY && p.date === todayFormatted)
//     .slice(0, 10);
// }

filterWishes() {
  const today = new Date();
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();

  const matchDate = (dateStr: string) => {
    if (!dateStr) return false;
    const parts = dateStr.split(' ');
    if (parts.length < 2) return false;

    const day = parseInt(parts[0]);
    const monthName = parts[1].toLowerCase();
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    return day === todayDay && monthIndex === todayMonth;
  };

  this.birthdayWishes = this.allWishes.filter(
    p => p.category === this.CATEGORY_BIRTHDAY && matchDate(p.date)
  );
  this.anniversaryWishes = this.allWishes.filter(
    p => p.category === this.CATEGORY_ANNIVERSARY && matchDate(p.date)
  );
  this.onboardingWishes = this.allWishes.filter(
    p => p.category === this.CATEGORY_ONBOARDING && matchDate(p.date)
  );

  this.filteredWishes = [
    ...this.birthdayWishes,
    ...this.anniversaryWishes,
    ...this.onboardingWishes,
  ];

  console.log('🎂 Birthday filtered:', this.birthdayWishes);
  console.log('💍 Anniversary filtered:', this.anniversaryWishes);
  console.log('🚀 Onboarding filtered:', this.onboardingWishes);
}



// updateVisibleCards() {
//   const total = this.allWishes.length;
//   this.visibleCards = [];
//   for (let i = 0; i < this.visibleCount; i++) {
//     const index = (this.currentIndex + i) % total;
//     this.visibleCards.push(this.allWishes[index]);
//   }
// }

updateVisibleCards() {
  const source = this.filteredWishes.length ? this.filteredWishes : this.allWishes;
  this.visibleCards = source.slice(this.startIndex, this.startIndex + this.visibleCount);
}
  

// updateVisibleCards() {
//     const combined = [
//     ...this.onboardingWishes,
//     ...this.birthdayWishes,
//     ...this.anniversaryWishes
//   ];
//   // this.visibleCards = this.allWishes.slice(this.startIndex, this.startIndex + this.visibleCount);
//   this.visibleCards = combined.slice(this.startIndex, this.startIndex + this.visibleCount);
// }

  sendWishes(name: string) {
    Swal.fire({
      title: 'Wishes Sent!',
      text: `You have sent wishes to ${name}.`,
      icon: 'success',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'OK'
    });
  }

getCurrentCard(category: string) {
  const list =
    category === this.CATEGORY_ONBOARDING
      ? this.onboardingWishes
      : category === this.CATEGORY_BIRTHDAY
      ? this.birthdayWishes
      : this.anniversaryWishes;

  return list[this.currentIndexes[category]];
}
// Navigate to next set (if available)
nextPage() {
    if (this.allWishes.length === 0) return;
    this.startIndex = (this.startIndex + 1) % this.allWishes.length;
    this.updateVisibleCards();
}

// Navigate to previous set (if available)
previousPage() {
    if (this.allWishes.length === 0) return;
    this.startIndex =
      (this.startIndex - 1 + this.allWishes.length) % this.allWishes.length;
    this.updateVisibleCards();

}

// Helper to fetch list by category
getListByCategory(category: string) {
  switch (category) {
    case this.CATEGORY_ONBOARDING:
      return this.onboardingWishes;
    case this.CATEGORY_BIRTHDAY:
      return this.birthdayWishes;
    case this.CATEGORY_ANNIVERSARY:
      return this.anniversaryWishes;
    default:
      return [];
  }
}

startAutoScroll() {
    if (this.autoScrollInterval) clearInterval(this.autoScrollInterval);

    this.autoScrollInterval = setInterval(() => {
      this.nextPage();
    }, 2500); // scroll every 2.5 seconds
  }

  pauseScroll() {
    this.carouselTrack.nativeElement.style.animationPlayState = 'paused';
  }

  resumeScroll() {
   this.carouselTrack.nativeElement.style.animationPlayState = 'running';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const track = this.carouselTrack.nativeElement;
      const cards = track.querySelectorAll('.card');
      const gap = 25; // must match CSS gap

      // total width of first half (original cards)
      const totalWidth = Array.from(cards)
        .slice(0, cards.length / 2)
        .reduce((sum, card: any) => sum + card.offsetWidth + gap, 0);

      // set CSS variable for seamless scroll distance
      track.style.setProperty('--scroll-distance', `-${totalWidth}px`);
    });
  }

  trackByWish(index: number, card: any): any {
  // if your card object has a unique ID field, return it
  return card.id || card.employeeId || index;
}

}