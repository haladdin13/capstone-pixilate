export function normalizePaletteColors(palette) {

    const normalizedColors = palette.color_associations.map(assoc => assoc.color.hex_code);

    return {
        ...palette,
        colors: normalizedColors,
    };
}

export function normalizeRecommendedPalettes(palette){
    return palette;
}