import { assert } from "console";

export function asSVG(content: string, width: number, height: number) {
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">` + content + '</svg>'
}

export function colorLinesFlag(colors: Array<string>) {
    assert(colors.length >= 2 && colors.length <= 7)
    const startHeight = 4;
    const flagHeight = 24 - (2 * startHeight);
    const stepSize = Math.round(((flagHeight / colors.length) + Number.EPSILON) * 100) / 100;

    let output = "";
    let currentBottom = startHeight;
    let currentTop = currentBottom + stepSize;
    
    output += `<path d="M2 ${currentBottom+2}C2 ${currentBottom+0.89543} 2.89543 ${currentBottom} 4 ${currentBottom}H20C21.1046 ${currentBottom} 22 ${currentBottom+0.89543} 22 ${currentBottom+2}V${currentTop}H2V${currentBottom+2}Z" fill="${colors[0]}"/>`;
    for (let i = 1; i < colors.length - 1; i++) {
        currentBottom = currentTop;
        currentTop = currentBottom + stepSize;
        output += `<rect x="2" y="${currentBottom}" width="20" height="${stepSize}" fill="${colors[i]}"/>`;
    }
    currentBottom = currentTop;
    currentTop = currentBottom + stepSize;
    output += `<path d="M2 ${currentBottom}H22V${currentTop-2}C22 ${currentTop-2+1.046} 21.1046 ${currentTop} 20 ${currentTop}H4C2.89543 ${currentTop} 2 ${currentTop-2+1.046} 2 ${currentTop-2}V${currentBottom}Z" fill="${colors[colors.length - 1]}"/>`;
    console.log(output)
    return asSVG(output, 24, 24);
}