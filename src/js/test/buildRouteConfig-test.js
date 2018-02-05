const expect = require('chai').expect;
const buildRouteConfig = require('../buildRouteConfig');

describe('buildRouteConfig', () => {
    it('creates empty config for string urls', () => {
        const config = {
            urls: ['https://www.zillow.com/', 'https://www.zillow.com/mortgage-rates/']
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.zillow.com/': {},
            'https://www.zillow.com/mortgage-rates/': {}
        });
    });

    it('copies config for object urls', () => {
        const config = {
            urls: [
                {
                    url: 'https://www.zillow.com/',
                    foo: true
                },
                {
                    url: 'https://www.zillow.com/mortgage-rates/',
                    bar: true
                }
            ]
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.zillow.com/': {
                foo: true
            },
            'https://www.zillow.com/mortgage-rates/': {
                bar: true
            }
        });
    });

    it('resolves hostnames', () => {
        const config = {
            hostname: 'https://www.example.com/',
            urls: ['https://www.zillow.com/', { url: 'https://www.zillow.com/mortgage-rates/' }]
        };
        expect(buildRouteConfig(config)).to.eql({
            'https://www.example.com/': {},
            'https://www.example.com/mortgage-rates/': {}
        });
    });

    describe('rules', () => {
        it('has unknown levels', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            TitleTag: {
                                level: 'foo',
                                options: {}
                            },
                            Canonical: 'UNKNOWN LEVEL'
                        }
                    }
                ],
                rules: {
                    MixedContent: {
                        level: 'bar',
                        options: {}
                    },
                    NoRedirect: undefined,
                    MetaDescription: null
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {
                    rules: {
                        TitleTag: {
                            options: {}
                        },
                        MixedContent: {
                            options: {}
                        }
                    }
                }
            });
        });

        it('has missing levels', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            TitleTag: {
                                options: {}
                            }
                        }
                    }
                ],
                rules: {
                    MixedContent: {
                        options: {}
                    }
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {
                    rules: {
                        TitleTag: {
                            options: {}
                        },
                        MixedContent: {
                            options: {}
                        }
                    }
                }
            });
        });

        it('has empty rules', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            TitleTag: {}
                        }
                    }
                ],
                rules: {
                    MixedContent: {}
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {}
            });
        });

        it('inherits global rules', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            TitleTag: {
                                level: 1,
                                options: {}
                            },
                            Canonical: 0
                        }
                    }
                ],
                rules: {
                    MixedContent: {
                        level: 0,
                        options: {}
                    },
                    NoRedirect: 1,
                    MetaDescription: 2
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {
                    rules: {
                        MixedContent: {
                            level: 0,
                            options: {}
                        },
                        NoRedirect: {
                            level: 1
                        },
                        MetaDescription: {
                            level: 2
                        },
                        TitleTag: {
                            level: 1,
                            options: {}
                        },
                        Canonical: {
                            level: 0
                        }
                    }
                }
            });
        });

        it('overrides global rules with local rules', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            MixedContent: {
                                level: 1,
                                options: {
                                    foo: 'bar'
                                }
                            },
                            MetaDescription: 0
                        }
                    }
                ],
                rules: {
                    MixedContent: {
                        level: 0,
                        options: {}
                    },
                    NoRedirect: 1,
                    MetaDescription: 2
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {
                    rules: {
                        MixedContent: {
                            level: 1,
                            options: {
                                foo: 'bar'
                            }
                        },
                        NoRedirect: {
                            level: 1
                        },
                        MetaDescription: {
                            level: 0
                        }
                    }
                }
            });
        });

        it('converts string levels to number levels', () => {
            const config = {
                urls: [
                    {
                        url: 'https://www.zillow.com/mortgage-rates/',
                        rules: {
                            TitleTag: {
                                level: 'warn'
                            },
                            Canonical: 'off',
                            H1Tag: 'error'
                        }
                    }
                ],
                rules: {
                    MixedContent: {
                        level: 'off'
                    },
                    NoRedirect: 'warn',
                    MetaDescription: 'error'
                }
            };

            expect(buildRouteConfig(config)).to.eql({
                'https://www.zillow.com/mortgage-rates/': {
                    rules: {
                        MixedContent: {
                            level: 0
                        },
                        NoRedirect: {
                            level: 1
                        },
                        MetaDescription: {
                            level: 2
                        },
                        TitleTag: {
                            level: 1
                        },
                        Canonical: {
                            level: 0
                        },
                        H1Tag: {
                            level: 2
                        }
                    }
                }
            });
        });
    });
});
