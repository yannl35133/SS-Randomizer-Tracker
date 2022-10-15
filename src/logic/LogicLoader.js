import yaml from 'js-yaml';

class LogicLoader {
    static async loadLogicFiles(commit, logicFile) {
        const requirements = await LogicLoader.loadLogicFile(commit, logicFile);
        const locations = await LogicLoader.loadLogicFile(commit, 'checks.yaml');
        const hints = await LogicLoader.loadLogicFile(commit, 'hints.yaml');
        return { requirements, locations, hints };
    }

    static async loadLogicFile(commit, file) {
        const fileUrl = this.logicFileUrl(commit, file);
        const data = await this.loadFileFromUrl(fileUrl);
        return yaml.load(data);
    }

    static async loadFileFromUrl(url) {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.text();
    }

    static logicFileUrl(commit, file) {
        return `https://raw.githubusercontent.com/ssrando/ssrando/${commit}/${file}`;
    }
}

export default LogicLoader;
