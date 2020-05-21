const moment = require('moment');
const {flatten, sumBy, take} = require('lodash');

let config = require('./cv.json');

const projects = config
    .experience
    .map(mapExperience)
    .sort((a, b) => b.endTs - a.endTs)
const otherExperience = config
    .otherExperience
    .map(mapExperience)
    .sort((a, b) => b.endTs - a.endTs)

const technologies = [...new Set(getStack(projects).concat(getStack(otherExperience)))];
const technologiesExperience = technologies
    .map(name => {
        const projectExperience = projects.filter(project => project.stack.find(stackItem => stackItem === name));
        const nonProjectExperience = otherExperience.filter(project => project.stack.find(stackItem => stackItem === name));
        const durationSec = sumBy(projectExperience.concat(nonProjectExperience), project => project.durationSec)
        return {
            name,
            durationSec,
            duration: moment.duration(durationSec, 'seconds').humanize(),
        }
    })
    .sort((a, b) => b.durationSec - a.durationSec);

const responsibilities = [...new Set(getResponsibilities(projects))]
    .map(name => {
        const projectExperience = projects.filter(project => project.responsibilities.find(stackItem => stackItem === name));
        const durationSec = sumBy(projectExperience, project => project.durationSec)
        return {
            name,
            durationSec,
            duration: moment.duration(durationSec, 'seconds').humanize(),
        }
    })
    .sort((a, b) => b.durationSec - a.durationSec);

console.log('------------------------------------ <Projects> ---------------------------------------')
projects.forEach(printProject)
console.log('------------------------------------ </Projects> ---------------------------------------')
console.log('------------------------------------ <Stack> ---------------------------------------')
take(technologiesExperience, 20).forEach(printStack)
console.log('------------------------------------ </Stack> ---------------------------------------')
console.log('------------------------------------ <Responsibilities> ---------------------------------------')
take(responsibilities, 10).forEach(printResponsibility)
console.log('------------------------------------ </Responsibilities> ---------------------------------------')

function getStack(experience) {
    return flatten(experience.map(project => project.stack));
}

function getResponsibilities(experience) {
    return flatten(experience.map(project => project.responsibilities));
}

function mapExperience(experience) {
    const {startAt, endAt} = experience;
    const startTs = moment(startAt).unix();
    const endTs = moment(endAt).unix();
    const duration = endTs - startTs;
    return {
        ...experience,
        startTs,
        endTs,
        duration: moment.duration(duration, 'seconds').humanize(),
        durationSec: duration
    }
}

function printProject(experience) {
    const clientRow = experience.client !== "" && experience.client !== null
        ? `Client: ${experience.client}\n` : '';
    const template = `${clientRow}Project name: ${experience.project}
Project description: ${experience.projectDescription}
Position: ${experience.position}
Responsibilities: ${experience.responsibilities.join(", ")}
Duration: ${experience.duration}
Stack: ${experience.stack.join(", ")}
Environment: ${experience.environment.join(", ")}
`;

    console.log(template);
}

function printStack(technology) {
    const template = `${technology.name}\t${technology.duration}`;
    console.log(template);
}

function printResponsibility(responsibility) {
    const template = `${responsibility.name}\t${responsibility.duration}`;
    console.log(template);
}