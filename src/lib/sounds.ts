// Ses dosyalarını yönetmek için yardımcı fonksiyonlar
let clickSound: HTMLAudioElement;
let successSound: HTMLAudioElement;

// Sesleri önceden yükle
export function initializeSounds() {
  if (typeof window !== 'undefined') {
    clickSound = new Audio('/sounds/click.mp3');
    successSound = new Audio('/sounds/success.mp3');
    
    // Sesleri önceden yükle
    clickSound.load();
    successSound.load();
    
    // Ses seviyelerini ayarla
    clickSound.volume = 0.3;
    successSound.volume = 0.5;
  }
}

// Tıklama sesini çal
export function playClick() {
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play();
  }
}

// Başarı sesini çal
export function playSuccess() {
  if (successSound) {
    successSound.currentTime = 0;
    successSound.play();
  }
}

// Ses ayarlarını yönetmek için
export const toggleSounds = (enabled: boolean) => {
  if (clickSound) clickSound.muted = !enabled;
  if (successSound) successSound.muted = !enabled;
}; 