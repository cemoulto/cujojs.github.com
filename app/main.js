define({ // Wire spec

	helloSample: { wire: 'app/hello-sample/spec' },

	contactsSample: { wire: 'app/contacts-sample/spec' },

	homepageSample: { wire: 'app/homepage-sample/spec' },

	subheaderStrings: { module: 'i18n!app/subheader/strings' },
	subheaderText: {
		create: {
			module: 'app/subheader/selectText',
			args: { $ref: 'subheaderStrings.phrases' }
		}
	},

	subheader: {
		render: {
			template: { module: 'text!app/subheader/template.html' },
			replace: { text: { $ref: 'subheaderText' } },
			at: { $ref: 'first!.subheader' }
		}
	},

	theme: { module: 'css!theme/basic.css' },
	highlightTheme: { module: 'css!highlight/github.css' },

	$plugins: [
		{ module: 'wire/dom', classes: { init: 'loading' } },
		'wire/dom/render'
	]
});