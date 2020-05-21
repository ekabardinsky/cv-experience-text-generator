const adapters = [require('./HhAdapter')];

module.exports = (config, projects, technologiesExperience, responsibilitiesExperience) => {
    return Promise.all(
        adapters.map(adapter => adapter.push(config, projects, technologiesExperience, responsibilitiesExperience))
    );
}