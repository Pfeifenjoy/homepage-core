//@flow

import fs from "fs"

export const read_file = (path: string): Promise<string> => new Promise((resolve, reject) => {
	fs.readFile(path, "utf8", (e, data) => {
		if(e) {
			reject(e)
		} else {
			resolve(data)
		}
	})
})
