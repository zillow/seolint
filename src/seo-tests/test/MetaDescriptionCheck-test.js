const expect = require('chai').expect;
const { parser, validator } = require('../MetaDescriptionCheck');

describe('MetaDescriptionCheck.js', () => {
    describe('parser', () => {
        it('client and server description', () => {
            const parsed = parser({
                client: {
                    content:
                        '<html><head><meta name="description" content="client description" /></head><body></body></html>'
                },
                server: {
                    content:
                        '<html><head><meta name="description" content="server description" /></head><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                clientDescription: 'client description',
                serverDescription: 'server description'
            });
        });
        it('client only description', () => {
            const parsed = parser({
                client: {
                    content:
                        '<html><head><meta name="description" content="client description" /></head><body></body></html>'
                },
                server: { content: '<html><head></head><body></body></html>' }
            });
            expect(parsed).to.eql({
                clientDescription: 'client description',
                serverDescription: null
            });
        });
        it('server only description', () => {
            const parsed = parser({
                client: { content: '<html><head></head><body></body></html>' },
                server: {
                    content:
                        '<html><head><meta name="description" content="server description" /></head><body></body></html>'
                }
            });
            expect(parsed).to.eql({
                clientDescription: null,
                serverDescription: 'server description'
            });
        });
        it('no description', () => {
            const parsed = parser({
                client: { content: '<html><head></head><body></body></html>' },
                server: { content: '<html><head></head><body></body></html>' }
            });
            expect(parsed).to.eql({
                clientDescription: null,
                serverDescription: null
            });
        });
    });

    describe('validator', () => {
        it('succeeds with matching client and server description', () => {
            const validatorFn = validator.bind(null, {
                clientDescription: 'This is a test description that is greater than 50 characters',
                serverDescription: 'This is a test description that is greater than 50 characters'
            });
            expect(validatorFn).to.not.throw();
        });

        it('fails with mismatched client and server description', () => {
            const validatorFn = validator.bind(null, {
                clientDescription: 'This is a test description that is greater than 50 characters',
                serverDescription: 'This is another test description that is greater than 50 characters'
            });
            expect(validatorFn).to.throw();
        });

        it('succeeds with client only description', () => {
            const validatorFn = validator.bind(null, {
                clientDescription: 'This is a test description that is greater than 50 characters',
                serverDescription: ''
            });
            expect(validatorFn).to.not.throw();
        });

        it('fails when no description exists', () => {
            const validatorFn = validator.bind(null, {
                clientDescription: '',
                serverDescription: ''
            });
            expect(validatorFn).to.throw();
        });

        it('fails if description is less than 50 characters', () => {
            const validatorFn = validator.bind(null, {
                clientDescription: 'this description is only 49 characters abcdefghij',
                serverDescription: 'this description is only 49 characters abcdefghij'
            });
            expect(validatorFn).to.throw();
        });

        it('fails if description is more than 300 characters', () => {
            const validatorFn = validator.bind(null, {
                clientDescription:
                    'this description is 301 characters!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!! !!!!!!!!!!',
                serverDescription: ''
            });
            expect(validatorFn).to.throw();
        });
    });
});
