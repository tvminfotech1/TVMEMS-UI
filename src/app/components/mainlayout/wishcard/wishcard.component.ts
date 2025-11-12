import { Component, OnInit, AfterViewInit, ViewChild, ElementRef,OnDestroy } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from 'src/app/services/employee.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-wishcard',
  templateUrl: './wishcard.component.html',
  styleUrls: ['./wishcard.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class WishcardComponent implements AfterViewInit, OnDestroy {
    @ViewChild('carouselTrack') carouselTrack!: ElementRef;
  private scrollSpeed = 0.7; // control speed here
  private animationFrame: number = 0;
  private isPaused = false;
    isLoading = true;
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

// @ViewChild('carouselTrack') carouselTrack!: ElementRef<HTMLDivElement>;

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
        this.isLoading = true; // show loader before API call
  // First, try to load from backend
  this.http.get<any>('http://localhost:8080/personal/wishes').subscribe({
    next: data => {
      if (data && (data.BirthDay?.length || data.Onboarded?.length || data.Anniversary?.length)) {
        console.log('Loaded data from backend');
        this.prepareWishes(data);
      }
        this.isLoading = false;
    },
    error: err => {
      console.error('Error fetching wishes:', err);
        this.isLoading = false; 
    }
  });
}

  // ngOnDestroy() {
  //   if (this.autoScrollInterval) {
  //     clearInterval(this.autoScrollInterval);
  //   }
  // }
    ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
  }

prepareWishes(backendData: any) {
  console.log('🎉 Raw wishes:', backendData);

  this.birthdayWishes = backendData.BirthDay || [];
  this.anniversaryWishes = backendData.Anniversary || [];
  this.onboardingWishes = backendData.Onboarded || [];

  // this.allWishes = [
  //   ...this.birthdayWishes.map(p => ({
  //     ...p,
  //     category: this.CATEGORY_BIRTHDAY,
  //     date: p.dob 
  //       ? new Date(p.dob).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
  //       : (p.date || '')
  //   })),
  //   ...this.anniversaryWishes.map(p => ({
  //     ...p,
  //     category: this.CATEGORY_ANNIVERSARY,
  //     date: p.joiningDate 
  //       ? new Date(p.joiningDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
  //       : (p.date || '')
  //   })),
  //   ...this.onboardingWishes.map(p => ({
  //     ...p,
  //     category: this.CATEGORY_ONBOARDING,
  //     date: p.dob 
  //       ? new Date(p.dob).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
  //       : (p.date || '')
        
  //   }))
  // ];
  this.allWishes = [
  // 🎂 Birthdays
  ...this.birthdayWishes.map(p => ({
    ...p,
    category: this.CATEGORY_BIRTHDAY,
    date: p.dob 
      ? new Date(p.dob).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
      : (p.date || '')
  })),

  // 🎊 Onboarded & Anniversary — decided by experience
  ...this.anniversaryWishes.map(p => {
    let category = this.CATEGORY_ANNIVERSARY; // default
    if (p.joiningDate) {
      const joiningDate = new Date(p.joiningDate);
      const today = new Date();

      // Calculate full years between joining date and today
      const years =
        today.getFullYear() -
        joiningDate.getFullYear() -
        (today < new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate()) ? 1 : 0);

      if (years < 1) category = this.CATEGORY_ONBOARDING;
    }

    return {
      ...p,
      category,
      date: p.joiningDate 
        ? new Date(p.joiningDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }) 
        : (p.date || '')
    };
  }),
];

  // Debug (shows all mapped wishes before filtering)
  this.filteredWishes = this.allWishes;
  console.log('🔥 filteredWishes:', this.filteredWishes);
  console.log('Onboarding items:', this.onboardingWishes);
  console.log('Anniversary items:', this.anniversaryWishes);

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

updateVisibleCards() {
  const source = this.filteredWishes.length ? this.filteredWishes : this.allWishes;
  this.visibleCards = source.slice(this.startIndex, this.startIndex + this.visibleCount);
}

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

//   pauseScroll() {
//     this.carouselTrack.nativeElement.style.animationPlayState = 'paused';
//   }

//   resumeScroll() {
//    this.carouselTrack.nativeElement.style.animationPlayState = 'running';
//   }


// ngAfterViewInit() {
//   setTimeout(() => {
//     const track = this.carouselTrack.nativeElement;
//     const cards = Array.from(track.querySelectorAll('.card')) as HTMLElement[];
//     const gap = 25; // must match your CSS gap

//     if (cards.length === 0) return;

//     // ✅ Remove any previously cloned cards to avoid buildup
//     const existingClones = Array.from(track.querySelectorAll('.clone'));
//     existingClones.forEach(clone => clone.remove());

//     // ✅ Clone all cards once to create seamless loop
//     const cloneSet = cards.map(c => {
//       const clone = c.cloneNode(true) as HTMLElement;
//       clone.classList.add('clone');
//       track.appendChild(clone);
//       return clone;
//     });

//     //  Measure *total width of all cards INCLUDING gap*
//     const totalWidth = [...cards, ...cloneSet].reduce(
//       (sum, card, index, arr) => sum + card.offsetWidth + (index < arr.length - 1 ? gap : 0),
//       0
//     );

//     //  Set scroll distance = half (because animation goes halfway before repeating)
// const halfWidth = totalWidth / 2 - gap * 1.2;
//     track.style.setProperty('--scroll-distance', `-${halfWidth}px`);

//     // Set animation dynamically
//     const duration = Math.max(cards.length * 5, 20); // 5s per card
//     track.style.animation = `scrollLoop ${duration}s linear infinite`;
//     track.style.animationPlayState = 'running';
//   }, 1000);
// }
 ngAfterViewInit() {
    const track = this.carouselTrack.nativeElement;
    const clone = track.cloneNode(true);
    track.parentNode.appendChild(clone);

    this.animateScroll();
  }

  animateScroll() {
    const track = this.carouselTrack.nativeElement;
    const totalWidth = track.scrollWidth / 2;
    let translateX = 0;

    const step = () => {
      if (!this.isPaused) {
        translateX -= this.scrollSpeed;
        if (Math.abs(translateX) >= totalWidth) {
          // instantly reset position, seamless because clone continues
          translateX = 0;
        }
        track.style.transform = `translateX(${translateX}px)`;
        track.nextSibling.style.transform = `translateX(${translateX + totalWidth}px)`;
      }
      this.animationFrame = requestAnimationFrame(step);
    };

    step();
  }

  pauseScroll() {
    this.isPaused = true;
  }

  resumeScroll() {
    this.isPaused = false;
  }


  trackByWish(index: number, card: any): any {
  // if your card object has a unique ID field, return it
  return card.id || card.employeeId || index;
}

}