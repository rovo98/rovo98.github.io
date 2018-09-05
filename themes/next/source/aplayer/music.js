const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed:true,
    loop:'all',
    preload:'auto',
    volume:0.7,
    order: 'random',
    audio: [
        {
        name: '絵空事',
        artist: 'nano.RIPE',
        url: 'http://music.163.com/song/media/outer/url?id=792165.mp3',
        cover: '/aplayer/covers/huikongshi.jpg'
    },
    {
        name: '君の知らない物語',
        artist: 'Supercell',
        url: 'http://music.163.com/song/media/outer/url?id=399367218.mp3',
        cover: '/aplayer/covers/wuyu.jpg'
    },
    {
        name: '僕が死のうと思ったのは',
        artist: '中島美嘉',
        url: 'http://music.163.com/song/media/outer/url?id=467011317.mp3',
        cover: '/aplayer/covers/zdmj.jpg'
    },
    {
        name: '打上花火',
        artist: 'DAOKO / 米津玄師',
        url: 'http://music.163.com/song/media/outer/url?id=524149974.mp3',
        cover: '/aplayer/covers/dshh.jpg'
    },
    {
        name: '終わりの世界から',
        artist: 'やなぎなぎ / 麻枝准',
        url: 'http://music.163.com/song/media/outer/url?id=676508.mp3',
        cover: '/aplayer/covers/zsj.jpg'
    }
    ]
});
