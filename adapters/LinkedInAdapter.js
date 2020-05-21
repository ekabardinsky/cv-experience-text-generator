const request = require('request-promise');
const client = require('./unofficial-linkedin-api')
const {take} = require('lodash');
const {LINKED_IN_CLIENT, LINKED_IN_SECRET, LINKED_IN_CODE, LINKED_IN_STATE, LINKED_IN_EMAIL, LINKED_IN_PASSWORD} = process.env;
const scope = ['r_liteprofile'];
const Linkedin = require('node-linkedin')(LINKED_IN_CLIENT, LINKED_IN_SECRET, 'http://localhost:8080');

class LinkedInAdapter {
    async push(config, projects, technologiesExperience, responsibilitiesExperience) {

        if (LINKED_IN_CODE == null || LINKED_IN_STATE == null) {
            const auth_url = Linkedin.auth.authorize(scope);
            console.log('Open link above and set up LINKED_IN_CODE/LINKED_IN_STATE env vars to process linked in profile update ');
            return console.log(auth_url);
        } else {
            const authResult = await new Promise((resolve, reject) => {
                Linkedin.auth.getAccessToken(LINKED_IN_CODE, LINKED_IN_STATE, function(err, results) {
                    if ( err )
                        return console.error(err);
                    return resolve(results);
                });
            });

            await updateExperience(authResult.access_token, config, projects, technologiesExperience, responsibilitiesExperience)
        }
    }

    async authorize() {

    }

    async updateEducation(token, config, projects, technologiesExperience, responsibilitiesExperience) {
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

    async updateExperience(token, config, projects, technologiesExperience, responsibilitiesExperience) {
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
                    companyName: project.client || "Индивидуальное предпринимательство",
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

module.exports = new LinkedInAdapter()