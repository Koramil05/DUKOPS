// ================= FUNGSI UPDATE DESA HEADER DENGAN LOCAL FALLBACK =================
function updateDesaHeaderImage(desaName) {
    const headerImage = document.getElementById('desaHeaderImage');
    if (!headerImage) return;

    if (!desaName) {
        // Coba load default dari local, jika tidak ada gunakan GitHub
        const localDefaultUrl = 'banners/bnr_default.png';
        const githubDefaultUrl = 'https://github.com/Koramil05/DUKOPS/raw/main/bnr_default.png';
        
        headerImage.src = localDefaultUrl;
        headerImage.onerror = () => {
            headerImage.src = githubDefaultUrl; // Fallback ke GitHub
        };
        return;
    }

    const desaInfo = normalizeDesaName(desaName);
    const imageName = desaInfo.normalized.toLowerCase().replace(/\s+/g, '_');
    
    // Coba load dari local terlebih dahulu
    const localUrl = `banners/bnr_${imageName}.png`;
    const githubUrl = `https://github.com/Koramil05/DUKOPS/raw/main/bnr_${imageName}.png`;
    
    headerImage.src = localUrl;
    
    // Jika local tidak ada, fallback ke GitHub
    headerImage.onerror = () => {
        console.log(`Banner local tidak ditemukan: ${localUrl}, menggunakan GitHub...`);
        headerImage.src = githubUrl;
    };
}