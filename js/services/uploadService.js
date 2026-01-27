/* =========================================================
   IMAGE OPTIMIZATION
   ========================================================= */

async function optimizeImage(file) {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const MAX_WIDTH = 1280;
    const scale = Math.min(1, MAX_WIDTH / img.width);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            blob => {
                if (!blob) {
                    reject(new Error('Image optimization failed'));
                    return;
                }
                resolve(blob);
            },
            'image/webp',
            0.8
        );
    });
}

/* =========================================================
   MAIN UPLOAD SERVICE
   ========================================================= */

export async function uploadTradeScreenshot({
    file,
    tradeId,
    userId
}) {
    if (!file) return;

    // basic validation
    if (!file.type.startsWith('image/')) {
        throw new Error('Invalid file type');
    }

    // optimize image
    const optimizedBlob = await optimizeImage(file);

    const filePath = `${userId}/${tradeId}.webp`;

    /* ===== UPLOAD TO SUPABASE STORAGE ===== */
    const { error: uploadError } = await window.supabase
        .storage
        .from('trade-screenshots')
        .upload(filePath, optimizedBlob, {
            contentType: 'image/webp',
            upsert: true
        });

    if (uploadError) {
        console.error(uploadError);
        throw new Error('Screenshot upload failed');
    }

    /* ===== SAVE PATH TO DATABASE ===== */
    const { error: dbError } = await window.supabase
        .from('trades')
        .update({
            screenshot_path: filePath
        })
        .eq('id', tradeId);

    if (dbError) {
        console.error(dbError);
        throw new Error('Failed to save screenshot path');
    }
}
