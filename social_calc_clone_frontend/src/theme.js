import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000', // Black color for primary
        },
        secondary: {
            main: '#ffffff', // White color for secondary
        },
        background: {
            default: '#ffffff', // Default background color (white)
        },
        text: {
            primary: '#000000', // Primary text color (black)
            secondary: '#666666', // Secondary text color (dark gray)
        },
    },
    typography: {
        fontFamily: '"GeistSans", sans-serif', // Default font
        h1: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        h2: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        h3: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        h4: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        h5: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        h6: {
            fontFamily: '"GeistSans", sans-serif', // Header font
        },
        body1: {
            fontFamily: '"GeistSans", sans-serif', // Body font
        },
        body2: {
            fontFamily: '"GeistSans", sans-serif', // Body font
        },
        monospace: {
            fontFamily: '"GeistMono", monospace', // Monospace font
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '4px',
                    textTransform: 'none',
                    padding: '8px 16px',
                },
                contained: {
                    color: '#ffffff',
                    backgroundColor: '#000000',
                    '&:hover': {
                        backgroundColor: '#333333',
                    },
                },
                outlined: {
                    color: '#000000',
                    borderColor: '#000000',
                    '&:hover': {
                        borderColor: '#333333',
                        color: '#333333',
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                h1: {
                    color: '#000000',
                },
                h2: {
                    color: '#000000',
                },
                h3: {
                    color: '#000000',
                },
                h4: {
                    color: '#000000',
                },
                h5: {
                    color: '#000000',
                },
                h6: {
                    color: '#000000',
                },
            },
        },
    },
});

export default theme;
