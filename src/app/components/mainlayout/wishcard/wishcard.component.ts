import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from "@angular/core";
import Swal from "sweetalert2";
import { HttpClient } from "@angular/common/http";
import { EmployeeService } from "src/app/services/employee.service";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ViewEncapsulation } from "@angular/core";
import { BASE_URL } from "src/app/models/baseurl/constant";

@Component({
  selector: "app-wishcard",
  templateUrl: "./wishcard.component.html",
  styleUrls: ["./wishcard.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class WishcardComponent implements AfterViewInit, OnDestroy {
  @ViewChild("carouselTrack") carouselTrack!: ElementRef;
  private scrollSpeed = 1.0;
  private animationFrame: number = 0;
  private isPaused = false;
  isLoading = true;
  readonly CATEGORY_ONBOARDING = "Onboarded";
  readonly CATEGORY_BIRTHDAY = "BirthDay";
  readonly CATEGORY_ANNIVERSARY = "Anniversary";

  allWishes: any[] = [];
  today = new Date();

  onboardingWishes: any[] = [];
  birthdayWishes: any[] = [];
  anniversaryWishes: any[] = [];

  useDummyData = false;

  visibleStart: any = {
    [this.CATEGORY_ONBOARDING]: 0,
    [this.CATEGORY_BIRTHDAY]: 0,
    [this.CATEGORY_ANNIVERSARY]: 0,
  };
  visibleCards: any[] = [];
  currentIndex = 0;
  startIndex = 0;
  visibleCount = 3;
  currentIndexes: any = {
    Onboarded: 0,
    BirthDay: 0,
    Anniversary: 0,
  };
  autoScrollInterval: any;
  onboardingIndex = 0;
  birthdayIndex = 0;
  anniversaryIndex = 0;
  filteredWishes: any[] = [];

  constructor(
    private http: HttpClient,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.http.get<any>(`${BASE_URL}/personal/wishes`).subscribe({
      next: (data) => {
        if (
          data &&
          (data.BirthDay?.length ||
            data.Onboarded?.length ||
            data.Anniversary?.length)
        ) {
          this.prepareWishes(data);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animationFrame);
  }

  prepareWishes(backendData: any) {
    this.birthdayWishes = backendData.BirthDay || [];
    this.anniversaryWishes = backendData.Anniversary || [];
    this.onboardingWishes = backendData.Onboarded || [];

    this.allWishes = [
      ...this.birthdayWishes.map((p) => ({
        ...p,
        category: this.CATEGORY_BIRTHDAY,
        date: p.dob
          ? new Date(p.dob).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })
          : p.date || "",
      })),

      ...this.anniversaryWishes.map((p) => {
        let category = this.CATEGORY_ANNIVERSARY;
        if (p.joiningDate) {
          const joiningDate = new Date(p.joiningDate);
          const today = new Date();

          const years =
            today.getFullYear() -
            joiningDate.getFullYear() -
            (today <
            new Date(
              today.getFullYear(),
              joiningDate.getMonth(),
              joiningDate.getDate()
            )
              ? 1
              : 0);

          if (years < 1) category = this.CATEGORY_ONBOARDING;
        }

        return {
          ...p,
          category,
          date: p.joiningDate
            ? new Date(p.joiningDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })
            : p.date || "",
        };
      }),
    ];

    this.filteredWishes = this.allWishes;

    this.allWishes.forEach((p) => {
      if (p.pSizePhoto) {
        if (p.pSizePhoto.startsWith("data:image")) {
          p.image = this.sanitizer.bypassSecurityTrustUrl(p.pSizePhoto);
        } else {
          p.image = this.sanitizer.bypassSecurityTrustUrl(
            "data:image/jpeg;base64," + p.pSizePhoto
          );
        }
      } else if (p.employeeId) {
        this.employeeService.getEmployeePhoto(p.employeeId).subscribe({
          next: (blob) => {
            const objectURL = URL.createObjectURL(blob);
            p.image = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          },
          error: (err) => {
            console.error(" Error loading photo for", p.name, err);
            p.image = "assets/userimg/OIP.jpg";
          },
        });
      } else {
        p.image = "assets/userimg/OIP.jpg";
      }
    });

    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });

    this.filteredWishes = this.allWishes.filter((p) => p.date === todayStr);
    setTimeout(() => {
      const track = this.carouselTrack?.nativeElement;
      if (!track) return;

      const cardCount = this.filteredWishes.length;
      const screenWidth = window.innerWidth;

      if (screenWidth >= 1000 && cardCount > 3) {
        const clone = track.cloneNode(true);
        track.parentNode.appendChild(clone);
      } else {
        this.isPaused = true;
        track.style.transform = "translateX(0)";
        track.style.animation = "none";
        if (track.nextSibling) track.nextSibling.remove();
      }
    }, 500);
  }

  filterWishes() {
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth();

    const matchDate = (dateStr: string) => {
      if (!dateStr) return false;
      const parts = dateStr.split(" ");
      if (parts.length < 2) return false;

      const day = parseInt(parts[0]);
      const monthName = parts[1].toLowerCase();
      const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
      return day === todayDay && monthIndex === todayMonth;
    };

    this.birthdayWishes = this.allWishes.filter(
      (p) => p.category === this.CATEGORY_BIRTHDAY && matchDate(p.date)
    );
    this.anniversaryWishes = this.allWishes.filter(
      (p) => p.category === this.CATEGORY_ANNIVERSARY && matchDate(p.date)
    );
    this.onboardingWishes = this.allWishes.filter(
      (p) => p.category === this.CATEGORY_ONBOARDING && matchDate(p.date)
    );

    this.filteredWishes = [
      ...this.birthdayWishes,
      ...this.anniversaryWishes,
      ...this.onboardingWishes,
    ];
  }

  updateVisibleCards() {
    const source = this.filteredWishes.length
      ? this.filteredWishes
      : this.allWishes;
    this.visibleCards = source.slice(
      this.startIndex,
      this.startIndex + this.visibleCount
    );
  }

  sendWishes(name: string) {
    Swal.fire({
      title: "Wishes Sent!",
      text: `You have sent wishes to ${name}.`,
      icon: "success",
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
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
  nextPage() {
    if (this.allWishes.length === 0) return;
    this.startIndex = (this.startIndex + 1) % this.allWishes.length;
    this.updateVisibleCards();
  }

  previousPage() {
    if (this.allWishes.length === 0) return;
    this.startIndex =
      (this.startIndex - 1 + this.allWishes.length) % this.allWishes.length;
    this.updateVisibleCards();
  }

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
    }, 2500);
  }

  nextCardMobile() {
    const track = this.carouselTrack.nativeElement as HTMLElement;
    const cards = track.querySelectorAll(".card") as NodeListOf<HTMLElement>;
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 25;
    if (this.currentIndex >= cards.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }

    track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
  }

  prevCardMobile() {
    const track = this.carouselTrack.nativeElement as HTMLElement;
    const cards = track.querySelectorAll(".card") as NodeListOf<HTMLElement>;
    if (cards.length === 0) return;
    const cardWidth = cards[0].offsetWidth + 25;
    if (this.currentIndex <= 0) {
      this.currentIndex = cards.length - 1;
    } else {
      this.currentIndex--;
    }

    track.style.transform = `translateX(-${this.currentIndex * cardWidth}px)`;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const track = this.carouselTrack.nativeElement as HTMLElement;
      const cards = Array.from(
        track.querySelectorAll(".card")
      ) as HTMLElement[];
      if (!track || cards.length === 0) return;

      track.querySelectorAll(".clone").forEach((c) => c.remove());

      const screenWidth = window.innerWidth;

      if (screenWidth < 1024) {
        track.style.transform = "translateX(0)";
        cancelAnimationFrame(this.animationFrame);
      }

      if (screenWidth >= 1000 && cards.length > 3) {
        const clones = cards.map((c) => {
          const clone = c.cloneNode(true) as HTMLElement;
          clone.classList.add("clone");
          track.appendChild(clone);
          return clone;
        });
        const totalScrollWidth = track.scrollWidth / 2;
        this.startContinuousScroll(track, totalScrollWidth);
      } else {
        cancelAnimationFrame(this.animationFrame);
        track.style.transform = "translateX(0)";
      }
    }, 800);
  }

  startContinuousScroll(track: HTMLElement, originalWidth: number) {
    let translateX = 0;

    const loop = () => {
      if (!this.isPaused) {
        translateX -= this.scrollSpeed;

        if (Math.abs(translateX) >= originalWidth) {
          translateX = 0;
        }

        track.style.transform = `translateX(${translateX}px)`;
      }

      this.animationFrame = requestAnimationFrame(loop);
    };

    cancelAnimationFrame(this.animationFrame);
    loop();
  }

  pauseScroll() {
    this.isPaused = true;
  }

  resumeScroll() {
    this.isPaused = false;
  }

  trackByWish(index: number, card: any): any {
    return card.id || card.employeeId || index;
  }
}
