class DialogueManager {
    constructor(scene) {
        this.scene = scene; // A 'scene' é a cena atual onde o jogo está a correr. 
        // Guardo isto para poder criar elementos (texto, retângulos, etc.) nessa cena.
        this.container = null;
        //O 'container' serve como uma "pasta". Agrupo o fundo do diálogo e 
        // o texto dentro dele para podermos mover ou esconder tudo de uma vez.
        this.selectedIndex = 0;
        // Serve para menus de escolha (ex: "Sim" ou "Não"). Guarda qual opção está selecionada.
        this.callbacks = [];
        // Lista de funções que serão chamadas quando o diálogo terminar.
        this.timer = null;
        // Temporizador para o efeito de "texto a escrever-se" (letra a letra).
        this.textoAtual = "";      // Armazena o texto completo que o NPC vai dizer
        this.textoObj = null;      // Referência direta ao objeto de texto que está a ser exibido no ecrã.
        // É através disto que alterao o que o jogador lê.
    }

    falar(texto, arg1 = 'cotton', arg2 = 'neutra') {
    this.esconder();
    this.textoAtual = texto;
    
    // Lógica Inteligente
    // Se o arg1 for 'hawk' ou 'cotton', ele é o orador.
    // Se não for, assumimos que o orador é 'cotton' e o mood é o arg1.
    let orador = 'cotton';
    let mood = 'neutra';

    if (arg1 === 'hawk' || arg1 === 'cotton') {
        orador = arg1;
        mood = arg2;
    } else {
        orador = 'cotton';
        mood = arg1; // O primeiro argumento era o mood
    }
    // --------------------------
    
    const larguraTela = this.scene.cameras.main.width;
    const alturaTela = this.scene.cameras.main.height;
    
    this.container = this.scene.add.container(larguraTela / 2, alturaTela - 150);
    this.container.setScrollFactor(0); 
    this.container.setDepth(9999);
    this.container.setScale(1 / 1.5);

    const caixa = this.scene.add.rectangle(0, 0, 600, 150, 0x000000, 0.8);
    caixa.setStrokeStyle(2, 0xffffff);
    this.container.add(caixa);

    // Agora uso a chave montada com as variáveis que define na lógica inteligente
    const chaveAvatar = `${orador}_${mood}`;
    
    if (this.scene.textures.exists(chaveAvatar)) {
        const avatar = this.scene.add.image(-250, 0, chaveAvatar).setScale(0.8);
        this.container.add(avatar);
    } else {
        console.warn(`A imagem '${chaveAvatar}' não foi encontrada! Verifica o preload.`);
    }
    
    this.textoObj = this.scene.add.text(-150, -40, "", { 
        fontSize: '24px', fill: '#fff', wordWrap: { width: 400 } 
    });
    this.container.add(this.textoObj);

    let i = 0;
    this.timer = this.scene.time.addEvent({
        delay: 50,
        callback: () => {
            this.textoObj.text += texto[i];
            if (i % 2 === 0) {
                this.scene.sound.play('text_beep', { volume: 0.3 });
            }
            i++;
        },
        repeat: texto.length - 1
    });
}

    // Método para pular o efeito de escrita
    pular() {
        if (this.timer && !this.timer.paused) {
            this.timer.remove(); // Para o timer
            this.timer = null;
            this.textoObj.text = this.textoAtual; // Preenche o texto todo
            return true; // Indica que algo foi pulado
        }
        return false; // Nada para pular
    }

    pergunta(texto, mood, callbackSim, callbackNao) {
        this.falar(texto, mood);
        this.selectedIndex = 0;
        this.callbacks = [callbackSim, callbackNao];

        this.labelSim = this.scene.add.text(-80, 60, '[SIM]', { 
            fontSize: '24px', fill: '#0f0', backgroundColor: '#000' 
        }).setOrigin(0.5);
        
        this.labelNao = this.scene.add.text(80, 60, '[NÃO]', { 
            fontSize: '24px', fill: '#f00', backgroundColor: '#000' 
        }).setOrigin(0.5);

        this.container.add([this.labelSim, this.labelNao]);
        this.atualizarSelecao();
    }

    atualizarSelecao() {
        if (!this.labelSim || !this.labelNao) return;
        this.labelSim.setStyle({ fill: this.selectedIndex === 0 ? '#fff' : '#0f0', backgroundColor: this.selectedIndex === 0 ? '#555' : '#000' });
        this.labelNao.setStyle({ fill: this.selectedIndex === 1 ? '#fff' : '#f00', backgroundColor: this.selectedIndex === 1 ? '#555' : '#000' });
    }

    moverSelecao() {
        this.selectedIndex = this.selectedIndex === 0 ? 1 : 0;
        this.atualizarSelecao();
    }

    confirmar() {
        const cb = this.callbacks[this.selectedIndex];
        this.esconder();
        if (cb) cb();
    }

    esconder() {
        if (this.timer) {
            this.timer.remove();
            this.timer = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
    }
}