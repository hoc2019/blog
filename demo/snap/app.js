const imageBox = document.querySelector('#image');
const image = document.querySelector('#image img');
const mystatus = document.querySelector('#mystatus');
const btn = document.querySelector('#btn');
let isPlay = false;

btn.onclick = function() {
    start();
};

beginDetect();

function beginDetect() {
    const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
    let mediaStreamSource = null;
    let scriptProcessor = null;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // 获取用户的 media 信息
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(stream => {
                // 将麦克风的声音输入这个对象
                mediaStreamSource = audioContext.createMediaStreamSource(
                    stream
                );
                // 创建一个音频分析对象，采样的缓冲区大小为4096，输入和输出都是单声道
                scriptProcessor = audioContext.createScriptProcessor(
                    4096,
                    1,
                    1
                );
                // 将该分析对象与麦克风音频进行连接
                mediaStreamSource.connect(scriptProcessor);
                // 此举无甚效果，仅仅是因为解决 Chrome 自身的 bug
                scriptProcessor.connect(audioContext.destination);

                // 开始处理音频
                scriptProcessor.onaudioprocess = function(e) {
                    if (isPlay) return;
                    // 获得缓冲区的输入音频，转换为包含了PCM通道数据的32位浮点数组
                    let buffer = e.inputBuffer.getChannelData(0);
                    // 获取缓冲区中最大的音量值
                    let maxVal = Math.max.apply(Math, buffer);
                    // 显示音量值
                    if (maxVal > 0.9) {
                        console.log(maxVal);
                        start();
                    }
                };
            })
            .catch(error => {
                mystatus.innerHTML = '获取音频时好像出了点问题。' + error;
            });
    } else {
        mystatus.innerHTML = '不支持获取媒体接口';
    }
}

function start() {
    image.classList.remove('quickFade');
    snap(imageBox);
}
const snap = target => {
    isPlay = true;
    html2canvas(target, {
        allowTaint: false,
        useCORS: true,
        backgroundColor: 'transparent'
    })
        .then(canvas => {
            const canvasCount = 30;
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const pixelArr = imageData.data;
            const data = imageData.data.slice(0).fill(0);
            let imageDataArray = Array.from({ length: canvasCount }, e =>
                data.slice(0)
            );

            for (let i = 0; i < pixelArr.length; i += 4) {
                const p = Math.floor((i / pixelArr.length) * canvasCount);
                const a = imageDataArray[weightedRandomDistrib(p, canvasCount)];
                a[i] = pixelArr[i];
                a[i + 1] = pixelArr[i + 1];
                a[i + 2] = pixelArr[i + 2];
                a[i + 3] = pixelArr[i + 3];
            }
            for (let i = 0; i < canvasCount; i++) {
                const layer = newCanvasFromImageData(
                    imageDataArray[i],
                    canvas.width,
                    canvas.height
                );
                layer.classList.add('dust');
                setTimeout(() => {
                    animateTransform(
                        layer,
                        200,
                        -100,
                        chance.integer({ min: -25, max: 25 }),
                        2000
                    );
                    layer.classList.add('blur');
                    setTimeout(() => {
                        layer.remove();
                    }, 2050);
                }, 70 * i);

                //append dust to target
                target.appendChild(layer);
            }

            Array.from(target.querySelectorAll(':not(.dust)')).map(el => {
                el.classList.add('quickFade');
            });
        })
        .catch(function(error) {
            console.log(error);
        });
};

const weightedRandomDistrib = (peak, count) => {
    const prob = [],
        seq = [];
    for (let i = 0; i < count; i++) {
        prob.push(Math.pow(count - Math.abs(peak - i), 6));
        seq.push(i);
    }
    return chance.weighted(seq, prob);
};

const animateTransform = (elem, sx, sy, angle, duration) => {
    elem.animate(
        [
            { transform: 'rotate(0) translate(0, 0)' },
            {
                transform:
                    'rotate(' +
                    angle +
                    'deg) translate(' +
                    sx +
                    'px,' +
                    sy +
                    'px)'
            }
        ],
        {
            duration: duration,
            easing: 'ease-in'
        }
    );
};

const newCanvasFromImageData = (imageDataArray, w, h) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    tempCtx = canvas.getContext('2d');
    tempCtx.putImageData(new ImageData(imageDataArray, w, h), 0, 0);

    return canvas;
};
