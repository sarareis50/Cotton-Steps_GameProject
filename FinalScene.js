class FinalScene extends Phaser.Scene {
    constructor() { super('FinalScene'); }

    preload() {
        this.load.audio('beep', 'assets/audio/bleep026.ogg'); 
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        // Criar o som para ser usado no loop
        const somBeep = this.sound.add('beep', { volume: 0.2 });

        const textoObjeto = this.add.text(
            this.sys.game.config.width / 2, 
            this.sys.game.config.height / 2, 
            "", 
            { 
                fontSize: '40px', 
                fill: '#ffffff', 
                fontFamily: 'Spectral', 
                align: 'center'
            }
        ).setOrigin(0.5);

        const frase = "Finalmente me encontraste minha querida Cotton...";
        let index = 0;

        this.time.addEvent({
            delay: 150,
            callback: () => {
                textoObjeto.text += frase[index];
                
                // Toca o som a cada letra (excluindo espaços)
                if (frase[index] !== ' ' && frase[index] !== '.') {
                    somBeep.play();
                }
                
                index++;
                
                if (index === frase.length) {
                    this.mostrarOpcaoFinal();
                }
            },
            repeat: frase.length - 1
        });
    }

    mostrarOpcaoFinal() {
        this.time.delayedCall(2000, () => {
            const restartText = this.add.text(
                this.sys.game.config.width / 2, 
                this.sys.game.config.height / 2 + 100, 
                "Clique ENTER para sair", 
                { fontSize: '20px', fill: '#666666', fontFamily: 'Spectral' }
            ).setOrigin(0.5).setAlpha(0);

            this.tweens.add({
                targets: restartText,
                alpha: 1,
                duration: 2000
            });

            this.input.keyboard.once('keydown-ENTER', () => {
                location.reload(); 
            });
        });
    }
}