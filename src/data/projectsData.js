import one from '../assets/svg/projects/one.svg'
import two from '../assets/svg/projects/two.svg'
import three from '../assets/svg/projects/three.svg'
import four from '../assets/svg/projects/four.svg'
import five from '../assets/svg/projects/five.svg'
import six from '../assets/svg/projects/six.svg'
import seven from '../assets/svg/projects/seven.svg'
import eight from '../assets/svg/projects/eight.svg'


export const projectsData = [
    {
        id: 1,
        projectName: 'Website Builder',
        projectDesc: `Website builder tool allows users to design and create websites
        without having to edit code. Users can do everything, without designers and
        developers. Website Builder is built to make creating websites as easy as possible`,
        tags: ['React', 'Redux', 'Node.js'],
        code: 'https://github.com/orgs/One-com/teams/developers/repositories',
        demo: 'https://www.one.com/en/websitebuilder',
        image: one
    },
    {
        id: 2,
        projectName: 'wavemaker',
        projectDesc: `WaveMaker Platform combines rapid application Development (RAD)
        with PAAS (Platform As A Service) for customers wanting speedy creation of custom
        Apps that are browser delivered (responsive web) or device installed (hybrid mobile
        apps).`,
        tags: ['Angular', 'jQuery', 'Bootstrap'],
        code: 'https://github.com/wavemaker/wavemaker-app-runtime',
        demo: 'https://www.wavemaker.com/',
        image: two
    }
]


// Do not remove any fields.
// Leave it blank instead as shown below

/* 
{
    id: 1,
    projectName: 'Car Pooling System',
    projectDesc: '',
    tags: ['Flutter', 'React'],
    code: '',
    demo: '',
    image: ''
}, 
*/