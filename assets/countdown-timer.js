if (!customElements.get('countdown-timer')) {
    customElements.define(
      'countdown-timer',
      class CountdownTimer extends SliderComponent {
    constructor() {
      super();
      this.countdownInterval = null;     
    }
  
    checkActiveslide(){
      const active_slide = document.querySelectorAll('.announcement-bar :not(.hidden).slideshow__slide').length;
      const slider_buttons = document.querySelectorAll('.slider-button');
      if(active_slide <= 1){
        for (const slider_btn of slider_buttons) {
          slider_btn.classList.add('hidden');
        }
      }else{
        for (const slider_btn of slider_buttons) {
          slider_btn.classList.remove('hidden');
        }
      }
  
    }
  
    initializeButtonsActiveSlides(){
      setTimeout(() => {
       const slideshow = document.querySelector('slideshow-component');
        if (slideshow) {
          slideshow.dispatchEvent(new CustomEvent('refreshSlideshow'));
        }
        this.checkActiveslide();
       }, 500);
    }
  
   getParentNode(element, level = 1) {
      while (level-- > 0) {
        element = element.parentNode;
        if (!element) return null;
      }
      return element;
  }
  
    connectedCallback() {
      const countdown = () => {
        
        // Get current date and time
        const currentTime = new Date().getTime();
        
        // Get start date
        const salestartdate = this.getAttribute("salestart-date");
        var salestart_date = new Date(salestartdate).getTime();
        
        // Find the distance between current and start date
        const saletimeRemaining = salestart_date - currentTime; 
  
        // Get start deadline date
        const deadline1 = this.getAttribute("end-date");
        var deadline = new Date(deadline1).getTime();
        
        // Find the distance between current and end date
        const timeRemaining = deadline - currentTime; 
        let hiddenSection = document.querySelector(".countdown_hidden");      
  
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
  
        // Check now date and the count down start date
        if (saletimeRemaining <= 0) {
         if (timeRemaining <= 0) {
            clearInterval(this.countdownInterval); 
           if(this.getParentNode(this, 4)) {
            this.getParentNode(this, 4).classList.add('hidden'); 
              this.initializeButtonsActiveSlides();
           }
          } else if (timeRemaining < 24 * 60 * 60 * 1000) {
  
            hiddenSection.classList.remove('hidden');
            // Display the result in the element
            const formattedTime = `${hours}h ${minutes}m ${seconds}s`;
            this.innerHTML = `${formattedTime}`;
           // Remove particular slider and countdown in class
             if(this.getParentNode(this, 4)) {
                 this.getParentNode(this, 4).classList.remove('hidden'); 
                this.initializeButtonsActiveSlides();
             }
          } else {
            hiddenSection.classList.remove('hidden');
            const formattedTime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            this.innerHTML = `${formattedTime}`;
            if(this.getParentNode(this, 4)) {
              this.getParentNode(this, 4).classList.remove('hidden'); 
              this.initializeButtonsActiveSlides();
            }
          }
        }else{
              if(this.getParentNode(this, 4)) {
                this.getParentNode(this, 4).classList.add('hidden'); 
                this.initializeButtonsActiveSlides();
           }
        }
      }
      countdown();    
      this.countdownInterval = setInterval(countdown, 1000);
    }
  }
  )};
   
  class SliderCountdownTimerNew extends SliderComponent {
    constructor() {
      super();
      this.addEventListener('refreshSlideshow', () => {
        this.resetPages();
      }); 
    }
  }
  customElements.get('slideshow-component') || customElements.define('slideshow-component', SliderCountdownTimerNew);