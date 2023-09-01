class ScrollManager {
    constructor({
        sectionParent,
        sectionQuery = ".section",
        commonFunction = null,
        sectionFunctions = [],
        focussedClass = "focussedSection",
        rootMargin = "-50% 0% -50% 0%"
    }) { /*
        Properties:
            - sectionParent: node of the parent DOM object containing the sections or a query as a str 
            - sectionQuery: str, the query which, when performed upon the sectionParent, returns the relevant sections
            - commonFunction: function, takes 1 arguemtn, optional, a function that is triggered when any section is scrolled into 
            - sectionFunctions: list of functions, take no arguments, triggered when section with same index is scrolled into
            - focussedClass: str, class name to apply to sections in focus
            - rootMargin, str, the margin passed to the interSectionObserver, default is half way through viewport
        */

        let d3_integrate = typeof d3 != "undefined";
        // First set the sectionParent according to it's type
        if (sectionParent instanceof Node) {
            this.sectionParent = sectionParent;
        } else if (typeof sectionParent === "string") {
            sectionParent = document.querySelector(sectionParent);
        } else if (d3_integrate && sectionParent instanceof d3.selection) {
            sectionParent = sectionParent.node();
        }

        // Get all sections
        let sections = sectionParent.querySelectorAll(sectionQuery);
        sections.forEach((section, i) => {
            section.setAttribute("sectionIndex", i);
        });


        // Make our IntersectionObserver
        const observer = new IntersectionObserver(entries => {
            /*console.log(`Intersection: length${
                entries.length
            }, i: ${
                entries[0].target.getAttribute("sectionIndex")
            } `)*/

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    let section = entry.target;
                    console.warn(entry.target.getAttribute("sectionIndex"))


                    // unapply focussedClass from all selected Sections
                    sectionParent.querySelectorAll("." + focussedClass).forEach(section => {
                        section.classList.remove(focussedClass);
                    })

                    // then reapply it to the intersected Section
                    section.classList.add(focussedClass);

                    if (commonFunction) {
                        commonFunction(section); // if commonFunction is defined, call commonFunction with the section as an arg
                    }
                    if (section.getAttribute("sectionIndex") <= sectionFunctions.length) { // console.log(section.getAttribute("sectionIndex"));
                        sectionFunctions[section.getAttribute("sectionIndex")]();
                    }


                }
            })


        }, {"rootMargin": rootMargin})
        // and observe each section
        sections.forEach(function (section) {
            observer.observe(section)
        })

        this.sectionParent = sectionParent;
        this.sections = sections;
        this.observer = observer;

    }
}