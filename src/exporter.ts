import {writeFileSync} from "fs";

import * as path from "path";

export async function export_pdf(args) {
    let options = { format: 'A4' };
    let file = { content: args };
    //return await html_to_pdf.generatePdf(file, options)

    return "false"
}

export async function export_docx(args: string) {
    /*let imgs = args.match("<img(.*?)>")

    imgs.forEach((value) => {
        let src = value.match(`src="(.*?)"`)[1]

    })*/

   /* return await HTMLtoDOCX(args, null, {
        table: { row: { cantSplit: true } },
        footer: true,
        pageNumber: true,
    });
*/

    return "false"
}