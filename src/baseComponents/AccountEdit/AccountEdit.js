import React, {Component} from "react";

import PropTypes from "prop-types";

import validate from "validate.js";
import moment from "moment";

import {withStyles} from "@material-ui/core/styles";

import {
    mainContent,
    Grid,
    Typography,
    Box,
    Fade,
    CircularProgress,
    Badge,
    Avatar,
    Fab,
    Button,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    Hidden,
    TextField,
    Tooltip,
    IconButton,
    Divider, Container,
} from "@material-ui/core";

import {
    Close as CloseIcon,
    Photo as PhotoIcon,
    CloudUpload as CloudUploadIcon,
    Person as PersonIcon,
    Edit as EditIcon,
    PersonOutline as PersonOutlineIcon,
    Email as EmailIcon,
    Warning as WarningIcon,
    Check as CheckIcon,
    AccessTime as AccessTimeIcon,
    DeleteForever as DeleteForeverIcon, Lock as LockIcon,
} from "@material-ui/icons";

import constraintsAuth from "../../data/constraintsAuth";
import authentication from "../../services/authentication";

const styles = (theme) => ({
    mainContent: {
        paddingTop: theme.spacing(2),
    },

    badge: {
        top: theme.spacing(2),
        right: -theme.spacing(2),
    },

    loadingBadge: {
        top: "50%",
        right: "50%",
    },

    avatar: {
        marginRight: "auto",
        marginLeft: "auto",

        width: theme.spacing(14),
        height: theme.spacing(14),
    },

    nameInitials: {
        cursor: "default",
    },

    personIcon: {
        fontSize: theme.spacing(7),
    },

    small: {
        width: theme.spacing(4),
        height: theme.spacing(4),

        minHeight: "initial",
    },
});

const initialState = {
    profileCompletion: 0,
    securityRating: 0,
    showingField: "",
    avatar: null,
    avatarUrl: "",
    firstName: "",
    lastName: "",
    username: "",
    emailAddress: "",
    performingAction: false,
    loadingAvatar: false,
    sentVerificationEmail: false,
    errors: null,
    password: "",
    passwordConfirmation: "",
};

class AccountEdit extends Component {
    constructor(props) {
        super(props);

        this.state = initialState;
    }

    getNameInitialsOrIcon = () => {
        const {user} = this.props;

        if (!user) {
            return null;
        }

        const {classes, userData} = this.props;

        if (!userData) {
            return <PersonIcon className={classes.personIcon}/>;
        }

        const nameInitials = authentication.getNameInitials({
            ...user,
            ...userData,
        });

        if (nameInitials) {
            return (
                <Typography className={classes.nameInitials} variant="h2">
                    {nameInitials}
                </Typography>
            );
        }

        return <PersonIcon className={classes.personIcon}/>;
    };

    uploadAvatar = () => {
        const {avatar} = this.state;

        if (!avatar) {
            return;
        }

        this.setState(
            {
                performingAction: true,
                loadingAvatar: true,
            },
            () => {
                authentication
                    .changeAvatar(avatar)
                    .then((value) => {
                        const {user, userData} = this.props;

                        this.setState({
                            profileCompletion: authentication.getProfileCompletion({
                                ...user,
                                ...userData,
                            }),
                        });
                    })
                    .catch((reason) => {
                        const code = reason.code;
                        const message = reason.message;

                        switch (code) {
                            default:
                                this.props.openSnackbar(message);
                                return;
                        }
                    })
                    .finally(() => {
                        this.setState({
                            performingAction: false,
                            loadingAvatar: false,
                            avatar: null,
                            avatarUrl: "",
                        });
                    });
            }
        );
    };

    removeAvatar = () => {
        const {user} = this.props;

        const {avatar, avatarUrl} = this.state;

        if (!user.photoURL && !avatar && !avatarUrl) {
            return;
        }

        if (
            (!user.photoURL && avatar && avatarUrl) ||
            (user.photoURL && avatar && avatarUrl)
        ) {
            URL.revokeObjectURL(avatarUrl);

            this.setState({
                avatar: null,
                avatarUrl: "",
            });
        } else if (user.photoURL && !avatar && !avatarUrl) {
            this.setState(
                {
                    performingAction: true,
                    loadingAvatar: true,
                },
                () => {
                    authentication
                        .removeAvatar()
                        .then((value) => {
                            const {user, userData} = this.props;

                            this.setState({
                                profileCompletion: authentication.getProfileCompletion({
                                    ...user,
                                    ...userData,
                                }),
                            });
                        })
                        .catch((reason) => {
                            const code = reason.code;
                            const message = reason.message;

                            switch (code) {
                                default:
                                    this.props.openSnackbar(message);
                                    return;
                            }
                        })
                        .finally(() => {
                            this.setState({
                                performingAction: false,
                                loadingAvatar: false,
                            });
                        });
                }
            );
        }
    };

    showField = (fieldId) => {
        if (!fieldId) {
            return;
        }

        this.setState({
            showingField: fieldId,
        });
    };

    hideFields = (callback) => {
        this.setState(
            {
                showingField: "",
                firstName: "",
                lastName: "",
                username: "",
                emailAddress: "",
                errors: null,
            },
            () => {
                if (callback && typeof callback === "function") {
                    callback();
                }
            }
        );
    };

    changePassword = () => {
        const {password, passwordConfirmation} = this.state;

        const errors = validate(
            {
                password: password,
                passwordConfirmation: passwordConfirmation,
            },
            {
                password: constraintsAuth.password,
                passwordConfirmation: constraintsAuth.passwordConfirmation,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changePassword(password)
                            .then(() => {
                                this.hideFields(() => {
                                    this.props.openSnackbar("Changed password");
                                });
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeFirstName = () => {
        const {firstName} = this.state;

        const errors = validate(
            {
                firstName: firstName,
            },
            {
                firstName: constraintsAuth.firstName,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {userData} = this.props;

                if (firstName === userData.firstName) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeFirstName(firstName)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeLastName = () => {
        const {lastName} = this.state;

        const errors = validate(
            {
                lastName: lastName,
            },
            {
                lastName: constraintsAuth.lastName,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {userData} = this.props;

                if (lastName === userData.lastName) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeLastName(lastName)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeUsername = () => {
        const {username} = this.state;

        const errors = validate(
            {
                username: username,
            },
            {
                username: constraintsAuth.username,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {userData} = this.props;

                if (username === userData.username) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeUsername(username)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeEmailAddress = () => {
        const {emailAddress} = this.state;

        const errors = validate(
            {
                emailAddress: emailAddress,
            },
            {
                emailAddress: constraintsAuth.emailAddress,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {user} = this.props;

                if (emailAddress === user.email) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeEmailAddress(emailAddress)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeAbout = () => {
        const {about} = this.state;

        const errors = validate(
            {
                about: about,
            },
            {
                about: constraintsAuth.about,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {user} = this.props;

                if (about === user.about) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeAbout(about)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    changeEducation = () => {
        const {education} = this.state;

        const errors = validate(
            {
                education: education,
            },
            {
                education: constraintsAuth.education,
            }
        );

        if (errors) {
            this.setState({
                errors: errors,
            });

            return;
        }

        this.setState(
            {
                errors: null,
            },
            () => {
                const {user} = this.props;

                if (education === user.education) {
                    return;
                }

                this.setState(
                    {
                        performingAction: true,
                    },
                    () => {
                        authentication
                            .changeEducation(education)
                            .then(() => {
                                const {user, userData} = this.props;

                                this.setState(
                                    {
                                        profileCompletion: authentication.getProfileCompletion({
                                            ...user,
                                            ...userData,
                                        }),
                                    },
                                    () => {
                                        this.hideFields();
                                    }
                                );
                            })
                            .catch((reason) => {
                                const code = reason.code;
                                const message = reason.message;

                                switch (code) {
                                    default:
                                        this.props.openSnackbar(message);
                                        return;
                                }
                            })
                            .finally(() => {
                                this.setState({
                                    performingAction: false,
                                });
                            });
                    }
                );
            }
        );
    };

    verifyEmailAddress = () => {
        this.setState(
            {
                performingAction: true,
            },
            () => {
                authentication
                    .verifyEmailAddress()
                    .then(() => {
                        this.setState(
                            {
                                sentVerificationEmail: true,
                            },
                            () => {
                                this.props.openSnackbar("Sent verification e-mail");
                            }
                        );
                    })
                    .catch((reason) => {
                        const code = reason.code;
                        const message = reason.message;

                        switch (code) {
                            default:
                                this.props.openSnackbar(message);
                                return;
                        }
                    })
                    .finally(() => {
                        this.setState({
                            performingAction: false,
                        });
                    });
            }
        );
    };

    changeField = (fieldId) => {
        switch (fieldId) {
            case "first-name":
                this.changeFirstName();
                return;

            case "last-name":
                this.changeLastName();
                return;

            case "username":
                this.changeUsername();
                return;

            case "email-address":
                this.changeEmailAddress();
                return;

            case "about":
                this.changeAbout();
                return;

            case "education":
                this.changeEducation();
                return;

            default:
                return;
        }
    };

    handleKeyDown = (event, fieldId) => {
        if (!event || !fieldId) {
            return;
        }

        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }

        const key = event.key;

        if (!key) {
            return;
        }

        if (key === "Escape") {
            this.hideFields();
        } else if (key === "Enter") {
            this.changeField(fieldId);
        }
    };

    handlePasswordChange = (event) => {
        if (!event) {
            return;
        }

        const password = event.target.value;

        this.setState({
            password: password,
        });
    };

    handlePasswordConfirmationChange = (event) => {
        if (!event) {
            return;
        }

        const passwordConfirmation = event.target.value;

        this.setState({
            passwordConfirmation: passwordConfirmation,
        });
    };

    handleAvatarChange = (event) => {
        if (!event) {
            return;
        }

        const files = event.target.files;

        if (!files) {
            return;
        }

        const avatar = files[0];

        if (!avatar) {
            return;
        }

        const fileTypes = [
            "image/gif",
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/svg+xml",
        ];

        if (!fileTypes.includes(avatar.type)) {
            return;
        }

        if (avatar.size > 20 * 1024 * 1024) {
            return;
        }

        this.setState({
            avatar: avatar,
            avatarUrl: URL.createObjectURL(avatar),
        });
    };

    handleFirstNameChange = (event) => {
        if (!event) {
            return;
        }

        const firstName = event.target.value;

        this.setState({
            firstName: firstName,
        });
    };

    handleAboutChange = (event) => {
        if (!event) {
            return;
        }

        const about = event.target.value;

        this.setState({
            about: about,
        });
    };

    handleEducationChange = (event) => {
        if (!event) {
            return;
        }

        const education = event.target.value;

        this.setState({
            education: education,
        });
    };

    handleLastNameChange = (event) => {
        if (!event) {
            return;
        }

        const lastName = event.target.value;

        this.setState({
            lastName: lastName,
        });
    };

    handleUsernameChange = (event) => {
        if (!event) {
            return;
        }

        const username = event.target.value;

        this.setState({
            username: username,
        });
    };

    handleEmailAddressChange = (event) => {
        if (!event) {
            return;
        }

        const emailAddress = event.target.value;

        this.setState({
            emailAddress: emailAddress,
        });
    };

    render() {
        // Styling
        const {classes} = this.props;

        // Properties
        const {user, userData} = this.props;

        // Events
        const {onDeleteAccountClick} = this.props;

        const {
            profileCompletion,
            securityRating,
            showingField,
            performingAction,
            loadingAvatar,
            avatar,
            avatarUrl,
            firstName,
            lastName,
            username,
            emailAddress,
            sentVerificationEmail,
            errors,
            password,
            passwordConfirmation,
            about,
            education,
        } = this.state;

        const hasFirstName = userData && userData.firstName;
        const hasLastName = userData && userData.lastName;
        const hasUsername = userData && userData.username;
        const hasAbout = userData && userData.about;
        const hasEducation = userData && userData.education;
        const hasChangedPassword = userData && userData.lastPasswordChange;

        return (
            <Container classes={{root: classes.mainContent}}>
                <Box mb={2}>
                    <Hidden xsDown>
                        <Grid alignItems="center" container>
                            <Grid item xs>
                                <Box textAlign="center">
                                    <Box mb={1.5}>
                                        {avatar && avatarUrl && (
                                            <Badge
                                                classes={{badge: classes.badge}}
                                                badgeContent={
                                                    <Tooltip title="Удалить">
                                                        <Fab
                                                            classes={{sizeSmall: classes.small}}
                                                            color="secondary"
                                                            disabled={performingAction}
                                                            size="small"
                                                            onClick={this.removeAvatar}
                                                        >
                                                            <CloseIcon fontSize="small"/>
                                                        </Fab>
                                                    </Tooltip>
                                                }
                                            >
                                                {loadingAvatar && (
                                                    <Badge
                                                        classes={{badge: classes.loadingBadge}}
                                                        badgeContent={
                                                            <Fade
                                                                style={{transitionDelay: "1s"}}
                                                                in={loadingAvatar}
                                                                unmountOnExit
                                                            >
                                                                <CircularProgress size={120} thickness={1.8}/>
                                                            </Fade>
                                                        }
                                                    >
                                                        <Avatar
                                                            className={classes.avatar}
                                                            alt="Аватар"
                                                            src={avatarUrl}
                                                        />
                                                    </Badge>
                                                )}

                                                {!loadingAvatar && (
                                                    <Avatar
                                                        className={classes.avatar}
                                                        alt="Аватар"
                                                        src={avatarUrl}
                                                    />
                                                )}
                                            </Badge>
                                        )}

                                        {!avatar && !avatarUrl && (
                                            <>
                                                {user.photoURL && (
                                                    <Badge
                                                        classes={{badge: classes.badge}}
                                                        badgeContent={
                                                            <Tooltip title="Удалить">
                                                                <Fab
                                                                    classes={{sizeSmall: classes.small}}
                                                                    color="secondary"
                                                                    disabled={performingAction}
                                                                    size="small"
                                                                    onClick={this.removeAvatar}
                                                                >
                                                                    <CloseIcon fontSize="small"/>
                                                                </Fab>
                                                            </Tooltip>
                                                        }
                                                    >
                                                        {loadingAvatar && (
                                                            <Badge
                                                                classes={{badge: classes.loadingBadge}}
                                                                badgeContent={
                                                                    <Fade
                                                                        style={{transitionDelay: "1s"}}
                                                                        in={loadingAvatar}
                                                                        unmountOnExit
                                                                    >
                                                                        <CircularProgress
                                                                            size={120}
                                                                            thickness={1.8}
                                                                        />
                                                                    </Fade>
                                                                }
                                                            >
                                                                <Avatar
                                                                    className={classes.avatar}
                                                                    alt="Аватар"
                                                                    src={user.photoURL}
                                                                />
                                                            </Badge>
                                                        )}

                                                        {!loadingAvatar && (
                                                            <Avatar
                                                                className={classes.avatar}
                                                                alt="Аватар"
                                                                src={user.photoURL}
                                                            />
                                                        )}
                                                    </Badge>
                                                )}

                                                {!user.photoURL && (
                                                    <>
                                                        {loadingAvatar && (
                                                            <Badge
                                                                classes={{badge: classes.loadingBadge}}
                                                                badgeContent={
                                                                    <Fade
                                                                        style={{transitionDelay: "1s"}}
                                                                        in={loadingAvatar}
                                                                        unmountOnExit
                                                                    >
                                                                        <CircularProgress
                                                                            size={120}
                                                                            thickness={1.8}
                                                                        />
                                                                    </Fade>
                                                                }
                                                            >
                                                                <Avatar className={classes.avatar} alt="Аватар">
                                                                    {this.getNameInitialsOrIcon()}
                                                                </Avatar>
                                                            </Badge>
                                                        )}

                                                        {!loadingAvatar && (
                                                            <Avatar className={classes.avatar} alt="Аватар">
                                                                {this.getNameInitialsOrIcon()}
                                                            </Avatar>
                                                        )}
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </Box>

                                    {avatar && avatarUrl && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            startIcon={<CloudUploadIcon/>}
                                            variant="contained"
                                            onClick={this.uploadAvatar}
                                        >
                                            Загрузить
                                        </Button>
                                    )}

                                    {!avatar && !avatarUrl && (
                                        <>
                                            <input
                                                id="avatar-input"
                                                type="file"
                                                hidden
                                                accept="image/*"
                                                onChange={this.handleAvatarChange}
                                            />

                                            <label htmlFor="avatar-input">
                                                <Button
                                                    color="primary"
                                                    component="span"
                                                    disabled={performingAction}
                                                    startIcon={<PhotoIcon/>}
                                                    variant="contained"
                                                >
                                                    Выбрать...
                                                </Button>
                                            </label>
                                        </>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs>
                                <Box textAlign="center">
                                    <Typography variant="body1">Заполнение профиля</Typography>

                                    {profileCompletion === 0 && (
                                        <Typography color="error" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}

                                    {profileCompletion === 100 && (
                                        <Typography color="primary" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}

                                    {profileCompletion !== 0 && profileCompletion !== 100 && (
                                        <Typography color="secondary" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs>
                                <Box textAlign="center">
                                    <Typography variant="body1">Рейтинг доверия</Typography>

                                    {securityRating === 0 && (
                                        <Typography color="error" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}

                                    {securityRating === 100 && (
                                        <Typography color="primary" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}

                                    {securityRating !== 0 && securityRating !== 100 && (
                                        <Typography color="secondary" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Hidden>

                    <Hidden smUp>
                        <Box textAlign="center" mb={3}>
                            <Box mb={1.5}>
                                {avatar && avatarUrl && (
                                    <Badge
                                        classes={{badge: classes.badge}}
                                        badgeContent={
                                            <Tooltip title="Remove">
                                                <Fab
                                                    classes={{sizeSmall: classes.small}}
                                                    color="secondary"
                                                    disabled={performingAction}
                                                    size="small"
                                                    onClick={this.removeAvatar}
                                                >
                                                    <CloseIcon fontSize="small"/>
                                                </Fab>
                                            </Tooltip>
                                        }
                                    >
                                        {loadingAvatar && (
                                            <Badge
                                                classes={{badge: classes.loadingBadge}}
                                                badgeContent={
                                                    <Fade
                                                        style={{transitionDelay: "1s"}}
                                                        in={loadingAvatar}
                                                        unmountOnExit
                                                    >
                                                        <CircularProgress size={120} thickness={1.8}/>
                                                    </Fade>
                                                }
                                            >
                                                <Avatar
                                                    className={classes.avatar}
                                                    alt="Avatar"
                                                    src={avatarUrl}
                                                />
                                            </Badge>
                                        )}

                                        {!loadingAvatar && (
                                            <Avatar
                                                className={classes.avatar}
                                                alt="Avatar"
                                                src={avatarUrl}
                                            />
                                        )}
                                    </Badge>
                                )}

                                {!avatar && !avatarUrl && (
                                    <>
                                        {user.photoURL && (
                                            <Badge
                                                classes={{badge: classes.badge}}
                                                badgeContent={
                                                    <Tooltip title="Remove">
                                                        <Fab
                                                            classes={{sizeSmall: classes.small}}
                                                            color="secondary"
                                                            disabled={performingAction}
                                                            size="small"
                                                            onClick={this.removeAvatar}
                                                        >
                                                            <CloseIcon fontSize="small"/>
                                                        </Fab>
                                                    </Tooltip>
                                                }
                                            >
                                                {loadingAvatar && (
                                                    <Badge
                                                        classes={{badge: classes.loadingBadge}}
                                                        badgeContent={
                                                            <CircularProgress size={120} thickness={1.8}/>
                                                        }
                                                    >
                                                        <Avatar
                                                            className={classes.avatar}
                                                            alt="Avatar"
                                                            src={user.photoURL}
                                                        />
                                                    </Badge>
                                                )}

                                                {!loadingAvatar && (
                                                    <Avatar
                                                        className={classes.avatar}
                                                        alt="Avatar"
                                                        src={user.photoURL}
                                                    />
                                                )}
                                            </Badge>
                                        )}

                                        {!user.photoURL && (
                                            <>
                                                {loadingAvatar && (
                                                    <Badge
                                                        classes={{badge: classes.loadingBadge}}
                                                        badgeContent={
                                                            <Fade
                                                                style={{transitionDelay: "1s"}}
                                                                in={loadingAvatar}
                                                                unmountOnExit
                                                            >
                                                                <CircularProgress size={120} thickness={1.8}/>
                                                            </Fade>
                                                        }
                                                    >
                                                        <Avatar className={classes.avatar} alt="Avatar">
                                                            {this.getNameInitialsOrIcon()}
                                                        </Avatar>
                                                    </Badge>
                                                )}

                                                {!loadingAvatar && (
                                                    <Avatar className={classes.avatar} alt="Avatar">
                                                        {this.getNameInitialsOrIcon()}
                                                    </Avatar>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </Box>

                            {avatar && avatarUrl && (
                                <Button
                                    color="primary"
                                    disabled={performingAction}
                                    startIcon={<CloudUploadIcon/>}
                                    variant="contained"
                                    onClick={this.uploadAvatar}
                                >
                                    Upload
                                </Button>
                            )}

                            {!avatar && !avatarUrl && (
                                <>
                                    <input
                                        id="avatar-input"
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={this.handleAvatarChange}
                                    />

                                    <label htmlFor="avatar-input">
                                        <Button
                                            color="primary"
                                            component="span"
                                            disabled={performingAction}
                                            startIcon={<PhotoIcon/>}
                                            variant="contained"
                                        >
                                            Choose...
                                        </Button>
                                    </label>
                                </>
                            )}
                        </Box>

                        <Grid container>
                            <Grid item xs>
                                <Box textAlign="center">
                                    <Typography variant="body1">Заполнение профиля</Typography>

                                    {profileCompletion === 0 && (
                                        <Typography color="error" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}

                                    {profileCompletion === 100 && (
                                        <Typography color="primary" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}

                                    {profileCompletion !== 0 && profileCompletion !== 100 && (
                                        <Typography color="secondary" variant="h5">
                                            {profileCompletion}%
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>

                            <Grid item xs>
                                <Box textAlign="center">
                                    <Typography variant="body1">Рейтинг доверия</Typography>

                                    {securityRating === 0 && (
                                        <Typography color="error" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}

                                    {securityRating === 100 && (
                                        <Typography color="primary" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}

                                    {securityRating !== 0 && securityRating !== 100 && (
                                        <Typography color="secondary" variant="h5">
                                            {securityRating}%
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Hidden>
                </Box>

                <List disablePadding>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <PersonIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {!hasEducation && (
                            <ListItemIcon>
                                <Tooltip title="Нет информации об образовании">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "education" && (
                            <Grid item xs={10} sm={10} md={10} lg={10}>
                                <TextField
                                    autoComplete="education"
                                    autoFocus
                                    disabled={performingAction}
                                    error={!!(errors && errors.education)}
                                    fullWidth
                                    helperText={
                                        errors && errors.education
                                            ? errors.education[0]
                                            : "Нажмите Enter, чтобы ифнормацию об образовании"
                                    }
                                    label="Об образовании"
                                    multiline
                                    placeholder={hasEducation && userData.education}
                                    required
                                    type="text"
                                    value={education}
                                    variant="filled"
                                    InputLabelProps={{required: false}}
                                    onBlur={this.hideFields}
                                    onKeyDown={(event) => this.handleKeyDown(event, "education")}
                                    onChange={this.handleEducationChange}
                                />
                            </Grid>
                        )}

                        {showingField !== "education" && (
                            <>
                                <Grid item xs={10} sm={10} md={10} lg={10}>
                                    <ListItemText
                                        primary="Об образовании"
                                        secondary={
                                            hasEducation
                                                ? userData.education
                                                : "Вы не указали информацию об образовании"
                                        }
                                    />
                                </Grid>

                                <ListItemSecondaryAction>
                                    {hasEducation && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("education")}>
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!hasEducation && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("education")}
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <PersonIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {!hasAbout && (
                            <ListItemIcon>
                                <Tooltip title="Нет информации о себе">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "about" && (
                            <Grid item xs={10} sm={10} md={10} lg={10}>
                                <TextField
                                    autoComplete="about"
                                    autoFocus
                                    disabled={performingAction}
                                    error={!!(errors && errors.about)}
                                    fullWidth
                                    helperText={
                                        errors && errors.about
                                            ? errors.about[0]
                                            : "Нажмите Enter, чтобы рассказать о себе"
                                    }
                                    label="О себе"
                                    multiline
                                    placeholder={hasAbout && userData.about}
                                    required
                                    type="text"
                                    value={about}
                                    variant="filled"
                                    InputLabelProps={{required: false}}
                                    onBlur={this.hideFields}
                                    onKeyDown={(event) => this.handleKeyDown(event, "about")}
                                    onChange={this.handleAboutChange}
                                />
                            </Grid>
                        )}

                        {showingField !== "about" && (
                            <>
                                <Grid item xs={10} sm={10} md={10} lg={10}>
                                    <ListItemText
                                        primary="О себе"
                                        secondary={
                                            hasAbout
                                                ? userData.about
                                                : "Вы не указали информацию о себе"
                                        }
                                    />
                                </Grid>

                                <ListItemSecondaryAction>
                                    {hasAbout && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("about")}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!hasAbout && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("about")}
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <PersonIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {!hasFirstName && (
                            <ListItemIcon>
                                <Tooltip title="Нет имени">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "first-name" && (
                            <TextField
                                autoComplete="given-name"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.firstName)}
                                fullWidth
                                helperText={
                                    errors && errors.firstName
                                        ? errors.firstName[0]
                                        : "Нажмите Enter, чтобы изменить свое имя"
                                }
                                label="Имя"
                                placeholder={hasFirstName && userData.firstName}
                                required
                                type="text"
                                value={firstName}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) => this.handleKeyDown(event, "first-name")}
                                onChange={this.handleFirstNameChange}
                            />
                        )}

                        {showingField !== "first-name" && (
                            <>
                                <ListItemText
                                    primary="Имя"
                                    secondary={
                                        hasFirstName
                                            ? userData.firstName
                                            : "Вы не указали ваше имя"
                                    }
                                />

                                <ListItemSecondaryAction>
                                    {hasFirstName && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("first-name")}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!hasFirstName && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("first-name")}
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <PersonIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {!hasLastName && (
                            <ListItemIcon>
                                <Tooltip title="Нет фамилии">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "last-name" && (
                            <TextField
                                autoComplete="family-name"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.lastName)}
                                fullWidth
                                helperText={
                                    errors && errors.lastName
                                        ? errors.lastName[0]
                                        : "Нажмите Enter, чтобы изменить свою фамилию"
                                }
                                label="Фамилия"
                                placeholder={hasLastName && userData.lastName}
                                required
                                type="text"
                                value={lastName}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) => this.handleKeyDown(event, "last-name")}
                                onChange={this.handleLastNameChange}
                            />
                        )}

                        {showingField !== "last-name" && (
                            <>
                                <ListItemText
                                    primary="Фамилия"
                                    secondary={
                                        hasLastName
                                            ? userData.lastName
                                            : "Вы не указали вашу фамилию"
                                    }
                                />

                                <ListItemSecondaryAction>
                                    {hasLastName && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("last-name")}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!hasLastName && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("last-name")}
                                        >
                                            Добавить
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <PersonOutlineIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {!hasUsername && (
                            <ListItemIcon>
                                <Tooltip title="Нет никнейма">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "username" && (
                            <TextField
                                autoComplete="username"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.username)}
                                fullWidth
                                helperText={
                                    errors && errors.username
                                        ? errors.username[0]
                                        : "Нажмите Enter, чтобы изменить свой никнейм."
                                }
                                label="Никнейм"
                                placeholder={hasUsername && userData.username}
                                required
                                type="text"
                                value={username}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) => this.handleKeyDown(event, "username")}
                                onChange={this.handleUsernameChange}
                            />
                        )}

                        {showingField !== "username" && (
                            <>
                                <ListItemText
                                    primary="Никнейм"
                                    secondary={
                                        hasUsername
                                            ? userData.username
                                            : "Вы не указали ваш никнейм"
                                    }
                                />

                                <ListItemSecondaryAction>
                                    {hasUsername && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("username")}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!hasUsername && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("username")}
                                        >
                                            Add
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <EmailIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {user.email && (
                            <ListItemIcon>
                                <>
                                    {user.emailVerified && (
                                        <Tooltip title="Подтверждено">
                                            <CheckIcon color="primary"/>
                                        </Tooltip>
                                    )}

                                    {!user.emailVerified && (
                                        <Tooltip title="Не подтверждено">
                                            <WarningIcon color="error"/>
                                        </Tooltip>
                                    )}
                                </>
                            </ListItemIcon>
                        )}

                        {!user.email && (
                            <ListItemIcon>
                                <Tooltip title="Нет адреса эл. почты">
                                    <WarningIcon color="error"/>
                                </Tooltip>
                            </ListItemIcon>
                        )}

                        {showingField === "email-address" && (
                            <TextField
                                autoComplete="email"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.emailAddress)}
                                fullWidth
                                helperText={
                                    errors && errors.emailAddress
                                        ? errors.emailAddress[0]
                                        : "Нажмите Enter, чтобы изменить свой адрес эл. почты."
                                }
                                label="E-mail address"
                                placeholder={user.email}
                                required
                                type="email"
                                value={emailAddress}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) =>
                                    this.handleKeyDown(event, "email-address")
                                }
                                onChange={this.handleEmailAddressChange}
                            />
                        )}

                        {showingField !== "email-address" && (
                            <>
                                <ListItemText
                                    primary="Эл. почта"
                                    secondary={
                                        user.email ? user.email : "У вас нет адреса эл. почты"
                                    }
                                />

                                {user.email && !user.emailVerified && (
                                    <Box clone mr={7}>
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Verify">
                                                <div>
                                                    <IconButton
                                                        color="secondary"
                                                        disabled={performingAction || sentVerificationEmail}
                                                        onClick={this.verifyEmailAddress}
                                                    >
                                                        <CheckIcon/>
                                                    </IconButton>
                                                </div>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </Box>
                                )}

                                <ListItemSecondaryAction>
                                    {user.email && (
                                        <Tooltip title="Редактировать">
                                            <div>
                                                <IconButton
                                                    disabled={performingAction}
                                                    onClick={() => this.showField("email-address")}
                                                >
                                                    <EditIcon/>
                                                </IconButton>
                                            </div>
                                        </Tooltip>
                                    )}

                                    {!user.email && (
                                        <Button
                                            color="primary"
                                            disabled={performingAction}
                                            variant="contained"
                                            onClick={() => this.showField("email-address")}
                                        >
                                            Add
                                        </Button>
                                    )}
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <LockIcon/>
                            </ListItemIcon>
                        </Hidden>

                        {showingField === "password" && (
                            <TextField
                                autoComplete="new-password"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.password)}
                                fullWidth
                                helperText={
                                    errors && errors.password
                                        ? errors.password[0]
                                        : "Нажмите Enter, чтобы изменить пароль"
                                }
                                label="Password"
                                required
                                type="password"
                                value={password}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) => this.handleKeyDown(event, "password")}
                                onChange={this.handlePasswordChange}
                            />
                        )}

                        {showingField === "password-confirmation" && (
                            <TextField
                                autoComplete="new-password"
                                autoFocus
                                disabled={performingAction}
                                error={!!(errors && errors.passwordConfirmation)}
                                fullWidth
                                helperText={
                                    errors && errors.passwordConfirmation
                                        ? errors.passwordConfirmation[0]
                                        : "Нажмите Enter, чтобы изменить пароль"
                                }
                                label="Password confirmation"
                                required
                                type="password"
                                value={passwordConfirmation}
                                variant="filled"
                                InputLabelProps={{required: false}}
                                onBlur={this.hideFields}
                                onKeyDown={(event) =>
                                    this.handleKeyDown(event, "password-confirmation")
                                }
                                onChange={this.handlePasswordConfirmationChange}
                            />
                        )}

                        {showingField !== "password" &&
                        showingField !== "password-confirmation" && (
                            <>
                                <Hidden xsDown>
                                    <ListItemText
                                        primary="Пароль"
                                        secondary={
                                            hasChangedPassword
                                                ? `Последнее изменение ${moment(
                                                userData.lastPasswordChange.toDate()
                                                ).format("LL")}`
                                                : "Никогда не менялся"
                                        }
                                    />
                                </Hidden>

                                <Hidden smUp>
                                    <ListItemText
                                        primary="Пароль"
                                        secondary={
                                            hasChangedPassword
                                                ? `Последнее изменение ${moment(
                                                userData.lastPasswordChange.toDate()
                                                ).format("ll")}`
                                                : "Никогда не изменялся"
                                        }
                                    />
                                </Hidden>

                                <ListItemSecondaryAction>
                                    <Tooltip title="Редактировать">
                                        <div>
                                            <IconButton
                                                disabled={performingAction}
                                                onClick={() => this.showField("password")}
                                            >
                                                <EditIcon/>
                                            </IconButton>
                                        </div>
                                    </Tooltip>
                                </ListItemSecondaryAction>
                            </>
                        )}
                    </ListItem>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <AccessTimeIcon/>
                            </ListItemIcon>
                        </Hidden>

                        <Hidden xsDown>
                            <ListItemText
                                primary="Вход"
                                secondary={moment(user.metadata.lastSignInTime).format("LLLL")}
                            />
                        </Hidden>

                        <Hidden smUp>
                            <ListItemText
                                primary="Вход"
                                secondary={moment(user.metadata.lastSignInTime).format("llll")}
                            />
                        </Hidden>
                    </ListItem>

                    <Box mt={1} mb={1}>
                        <Divider light/>
                    </Box>

                    <ListItem>
                        <Hidden xsDown>
                            <ListItemIcon>
                                <DeleteForeverIcon/>
                            </ListItemIcon>
                        </Hidden>

                        <ListItemText
                            primary="Удалить аккаунт"
                            secondary="Аккаунт невозможно будет восстановить"
                        />

                        <ListItemSecondaryAction>
                            <Button
                                color="secondary"
                                disabled={performingAction}
                                variant="contained"
                                onClick={onDeleteAccountClick}
                            >
                                Удалить
                            </Button>
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </Container>
        );
    }

    componentDidMount() {
        const {user, userData} = this.props;

        this.setState({
            profileCompletion: authentication.getProfileCompletion({
                ...user,
                ...userData,
            }),
            securityRating: authentication.getSecurityRating(user, userData),
        });
    }

    componentWillUnmount() {
        const {avatarUrl} = this.state;

        if (avatarUrl) {
            URL.revokeObjectURL(avatarUrl);

            this.setState({
                avatarUrl: "",
            });
        }
    }
}

AccountEdit.propTypes = {
    // Styling
    classes: PropTypes.object.isRequired,

    // Properties
    user: PropTypes.object.isRequired,
    userData: PropTypes.object,

    // Functions
    openSnackbar: PropTypes.func.isRequired,

    // Events
    onDeleteAccountClick: PropTypes.func.isRequired,
};

export default withStyles(styles)(AccountEdit);
