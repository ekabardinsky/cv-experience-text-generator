const request = require('request-promise');
const {take} = require('lodash');
const {HH_TOKEN, HH_RESUME, HH_COOKIES} = process.env;

class HhAdapter {
    async push(config, projects, technologiesExperience, responsibilitiesExperience) {
        await this.updateExperience(config, projects, technologiesExperience, responsibilitiesExperience);
        await this.updateEducation(config, projects, technologiesExperience, responsibilitiesExperience);
    }

    async updateEducation(config, projects, technologiesExperience, responsibilitiesExperience) {
        console.log('Start updating hh education');
        const body = {
            attestationEducation: [],
            lang: [{string: "RU"}, {string: "EN"}],
            proftest: [
                {
                    resultsReceived: false,
                    attached: false
                }
            ],
            certificate: config.certifications.map(certificate => {
                return {
                    title: certificate.name,
                    achievementDate: certificate.issueDate,
                    url: certificate.link,
                    type: "custom",
                    selected: true
                }
            })
        };

        try {
            const result = await request({
                uri: `https://tyumen.hh.ru/applicant/resumes/edit/education`,
                qs: {
                    resume: HH_RESUME
                },
                method: 'POST',
                json: true,
                headers: {
                    'x-xsrftoken': HH_TOKEN,
                    'Accept': '*/*',
                    'Cookie': HH_COOKIES
                },
                body
            });
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        console.log('End updating hh education');
    }

    async updateExperience(config, projects, technologiesExperience, responsibilitiesExperience) {
        console.log('Start updating hh experience');
        const body = {
            driverLicenseTypes: [],
            experience: projects.map(project => {
                const description = `
Описание проекта: ${project.projectDescription}

Обязанности: ${project.responsibilities.join(", ")}

Технологии: ${project.stack.concat(project.environment).join(", ")}
`;
                return {
                    companyName: "Индивидуальное предпринимательство",
                    description,
                    position: project.position,
                    startDate: project.startAt,
                    endDate: project.endAt != null ? project.endAt : null,
                }
            }),
            hasVehicle: [{string: false}],
            keySkills: take(technologiesExperience, 20).map(skill => ({string: skill.name})),
            lang: [{string: "RU"}, {string: "EN"}],
            portfolioUrls: [],
            recommendation: [],
            skills: []
        };

        try {
            const result = await request({
                uri: `https://tyumen.hh.ru/applicant/resumes/edit/experience`,
                qs: {
                    resume: HH_RESUME
                },
                method: 'POST',
                json: true,
                headers: {
                    'x-xsrftoken': HH_TOKEN,
                    'Accept': '*/*',
                    'Cookie': HH_COOKIES
                },
                body
            });
            console.log(result);
        } catch (e) {
            console.log(e);
        }
        console.log('End updating hh experience');
    }
}

module.exports = new HhAdapter()