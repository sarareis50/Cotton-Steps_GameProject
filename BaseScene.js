class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key: key });
        
        this.TILESET_MAP = {
            'topdownhouse_floorsandwalls': 'img_floors',
            'topdownhouse_doorsandwindows': 'img_doors',
            'topdownhouse_furniturestate1': 'img_furn1',
            'objetos_cozinha': 'img_furn2',
            'topdownhouse_floorsandwalls_opendoors': 'img_floors_open',
            'topdownhouse_smallitems': 'img_small'
                };
              
    }

    preload() {

        this.load.atlas('cotton_player', 
            'assets/imagens/cotton_animation/cat1.png', 
            'assets/imagens/cotton_animation/player_data.json');

        this.load.image('cotton_neutra', 'assets/imagens/cotton/cotton_neutra.png');
        this.load.image('cotton_happy', 'assets/imagens/cotton/cotton_happy.png');
        this.load.image('cotton_angry', 'assets/imagens/cotton/cotton_angry.png');

        this.load.image('hawk_neutro', 'assets/imagens/hawk/hawk_neutro.png');
        this.load.image('hawk_surpreso', 'assets/imagens/hawk/hawk_surpreso.png');
        this.load.image('hawk_triste', 'assets/imagens/hawk/hawk_triste.png');

        this.load.audio('musica_fundo', 'assets/audio/backgroundmusic.mp3');
    }

    // --- BUSCA DINÂMICA DE OBJETOS ---
    buscarCoordenadasObjeto(nomeCamada) {
    if (!this.mapa) return null;
    
    // Procura a camada pelo nome exato
    const camadaObjetos = this.mapa.getObjectLayer(nomeCamada); 
    if (!camadaObjetos) {
        console.warn("Camada de objetos não encontrada: " + nomeCamada);
        return null;
    }
    
    // Pega o primeiro objeto desta camada
    const obj = camadaObjetos.objects[0];
    if (!obj) {
        console.warn("Nenhum objeto encontrado na camada: " + nomeCamada);
        return null;
    }
    
    // Retorna a posição central do objeto
    return { 
        x: obj.x + (obj.width / 2), 
        y: obj.y + (obj.height / 2) 
    };
}

    criarAnimacoesDoPlayer() {
        if (this.anims.exists('andar_baixo')) return;

        const animsConfig = [
            { key: 'andar_baixo',    prefix: 'WalkFront', end: 3 },
            { key: 'andar_cima',     prefix: 'WalkBack',  end: 3 },
            { key: 'andar_esquerda', prefix: 'WalkLeft',  end: 3 },
            { key: 'andar_direita',  prefix: 'WalkRight', end: 3 }
        ];

        animsConfig.forEach(anim => {
            this.anims.create({
                key: anim.key,
                frames: this.anims.generateFrameNames('cotton_player', {
                    prefix: anim.prefix,
                    start: 0,
                    end: anim.end,
                    zeroPad: 4
                }),
                frameRate: 10,
                repeat: -1
            });
        });
    }

    setupPlayer(x, y) {
        this.player = this.physics.add.sprite(x, y, 'cotton_player', 'sprite311');
        this.player.body.setSize(16, 16, true);
        this.player.setCollideWorldBounds(true);
        this.player.body.onWorldBounds = true;
        this.player.setDepth(100);
        this.criarAnimacoesDoPlayer();
        return this.player;
    }



 configurarMapa(keyMapa) {
    const map = this.make.tilemap({ key: keyMapa });
    this.mapa = map;

    const tilesets = [];
    map.tilesets.forEach(ts => {
        if (ts.name === 'TopDownHouse_FloorsAndWalls_OpenDoors') {
            console.log("Ignorando tileset desnecessário:", ts.name);
            return;
        }

        const nomeTiled = ts.name.trim().toLowerCase();
        const chave = this.TILESET_MAP[nomeTiled];
        
        if (chave && this.textures.exists(chave)) {
            tilesets.push(map.addTilesetImage(ts.name, chave));
        } else {
            console.warn(`Tileset '${ts.name}' não mapeado.`);
        }
    });

    // --- BLOCO ATUALIZADO COM OS NOVOS FILTROS ---
    map.layers.forEach((layerData) => {
        console.log("A processar camada:", layerData.name); 

        const layer = map.createLayer(layerData.name, tilesets, 0, 0);
        
        if (layer) {
            const nome = layerData.name.toLowerCase();
            
            // Lógica de profundidade (Depth) para organizar o que fica por cima
            if (nome.includes('chao')) {
                layer.setDepth(0);
            } 
            else if (nome.includes('parede') || nome.includes('porta') || nome.includes('janela') || nome.includes('canto')) {
                layer.setDepth(1);
            } 
            else if (nome.includes('objeto') || nome.includes('furn') || nome.includes('small') || nome.includes('cama') || nome.includes('blocos')) {
                layer.setDepth(2);
            } 
            else {
                layer.setDepth(3); // Tudo o que não foi identificado fica no topo
            }

            // Configuração da camada de colisão
            if (layerData.name === 'Colisao') { 
                layer.setCollisionByExclusion([-1]);
                this.camadaDeColisaoTiles = layer;
                layer.setVisible(false);
            }
        }
    });
    // ----------------------------------------------

    return map;
}

    // --- PORTAL FLEXÍVEL ---
    // Agora podes dizer em que camada está o portal
    configurarPortal(nomeCamada, nomeObjeto, cenaDestino, xDestino, yDestino) {
        const camadaObjetos = this.mapa.getObjectLayer(nomeCamada); 
        if (!camadaObjetos) return;
        
        const obj = camadaObjetos.objects.find(o => o.name === nomeObjeto);
        if (!obj) return;

        this.portalZona = this.add.rectangle(obj.x + obj.width/2, obj.y + obj.height/2, obj.width, obj.height);
        this.physics.world.enable(this.portalZona);
        this.portalZona.body.setAllowGravity(false);
        this.portalZona.body.setSensor(true);
        this.portalZona.destino = cenaDestino;
        this.portalZona.coords = { x: xDestino, y: yDestino };
    }

    // --- MÉTODO PARA ZONAS DE INTERAÇÃO ---
configurarZonaInteracao(nomeCamada, nomeObjeto, callback) {
    const camadaObjetos = this.mapa.getObjectLayer(nomeCamada);
    if (!camadaObjetos) return;

    const obj = camadaObjetos.objects.find(o => o.name === nomeObjeto);
    if (!obj) return;

    const margem = 20; 
    // Criamos o retângulo APENAS como visual/referência, SEM interatividade do Phaser
    this.zonaInteracao = this.add.rectangle(
        obj.x + obj.width / 2, 
        obj.y + obj.height / 2, 
        obj.width + margem, 
        obj.height + margem, 
        0xff0000, 0
    );
    
    // Guardamos o callback manualmente
    this.zonaInteracao.callback = callback;
    
    // O MAIS IMPORTANTE: Garantir que não há interatividade aqui
    //this.zonaInteracao.setInteractive(false); 
    this.zonaInteracao.setFillStyle(0xff0000, 0.5);
}

iniciarMusicaGlobal() {
    // Verifica se o som já existe no gestor de áudio
    if (!this.sound.get('musica_fundo')) {
        // Se não existe, cria-o
        this.sound.add('musica_fundo', {
            loop: true,
            volume: 0.5
        });
    }

    // Só toca se não estiver a tocar
    const musica = this.sound.get('musica_fundo');
    if (!musica.isPlaying) {
        musica.play();
    }
}
}