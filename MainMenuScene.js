class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenuScene' });
    }

    preload() {
        // Carrega a música do menu com o nome exato
        // Garante que o ficheiro está na pasta assets/audio/ (ou ajusta o caminho)
        this.load.audio('musicaMenu', 'assets/audio/menu_music.mp3');
    }

    create() {
        // Toca a música do menu em loop com um volume agradável
        this.somMenu = this.sound.add('musicaMenu', { volume: 0.5, loop: true });
        this.somMenu.play();

        const labels = ['Novo Jogo', 'Continuar', 'Opções', 'Sair'];
        
        // Alinha perfeitamente com o centro do título "Cotton Steps" na direita[cite: 6]
        const posX = this.scale.width * 0.66; 
        
        // Começa logo abaixo do grafismo do título[cite: 6]
        const startY = this.scale.height * 0.48; 
        const spacing = 47; 

        labels.forEach((label, index) => {
            // O setOrigin(0.5) garante que o centro de cada palavra bate no eixo vertical do título[cite: 6]
            const btn = this.add.text(posX, startY + (index * spacing), label, {
                fontFamily: "'Spectral', serif", 
                fontSize: '26px', 
                fill: '#fcfaf0', 
                fontStyle: 'italic',
                align: 'center' 
            })
            .setOrigin(0.5) 
            .setInteractive({ useHandCursor: true })
            .setAlpha(0.75);

            btn.setShadow(3, 3, 'rgba(0,0,0,0.7)', 10);
            
            // Efeitos de Hover[cite: 6]
            btn.on('pointerover', () => { 
                btn.setStyle({ fill: '#e9c46a' }); 
                this.tweens.add({ targets: btn, scale: 1.1, alpha: 1, duration: 200 }); 
                // O alvo: o objeto (neste caso, um botão) que queremos animar.
                // O objetivo final: o botão vai crescer 10% do seu tamanho original.
                // O objetivo final de transparência: 1 significa totalmente visível (opaco).
                // O tempo: a animação demora 200 milissegundos (0.2 segundos) a completar-se.
            });
            
            btn.on('pointerout', () => { 
                btn.setStyle({ fill: '#fcfaf0' }); 
                this.tweens.add({ targets: btn, scale: 1.0, alpha: 0.75, duration: 200 }); 
            });

            if (label === 'Novo Jogo') {
                btn.on('pointerdown', () => {
                    document.getElementById('bg-video').style.display = 'none'; // Esconde o vídeo[cite: 6]

                    // Faz o som do menu desaparecer suavemente (Fade Out) em 1 segundo
                    this.tweens.add({
                        targets: this.somMenu,
                        volume: 0,
                        duration: 1000,
                        onComplete: () => {
                            this.somMenu.stop(); // Para o som do menu por completo
                            this.scene.start('IntroCottonSteps'); // Arranca a intro com a sua própria música![cite: 6]
                        }
                    });
                });
            }
        });
    }
}