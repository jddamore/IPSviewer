## Development Documentation

### Template Engine Used

SquirrelyJS (version 7) is the primary package used in creating templates for individual sections. 
https://squirrelly.js.org/

All of the templates are in the ./templates folder. The following sections are currently available for resource-level content, although the content displayed may not be adequate for all use cases:

- Advance Directives
- Composition
- Immunizations
- Medications
- Observations (Results only)
- Patient
- Problems 

Two additional templates are used in the presentation of content

- Checks, which is used to display some simple data checks 
- Text, which is used to display content from Composition.section.text from each respective section. This should be considered the "narrative" of each section

### Hosting and Development

1. Make sure node/npm is installed on server/desktop 
2. Clone this repository
3. Install dependencies (```npm i```)
4. Start express server (```node app.js```)

If you plan to make changes and develop the templates or code locally, use the following: 

```npm run debug```

### Adapting for Local Usage

Please note that this viewer has only been used in testing and connectathons and may not be suitable as-is for production use. With that caveat, the header and footer have been designed so that they can be simply commented out (or exlcuded in renderIPS.js) or changed to potential downstream use cases.

### Packages Used

- JQuery for basic DOM manipulation and AJAX calls
- Bootstrap for webpage display, buttons, responsiveness
- Popper for dropdowns
- SquirrelyJS as template engine






