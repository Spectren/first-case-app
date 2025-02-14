import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import Snack from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Close from "@material-ui/icons/Close";
// core components

import styles from "assets/jss/material-kit-react/components/userAboutHeader.js";
import classNames from "classnames";
import UserCard from "../UserCard/UserCard";
import UserSummary from "../UserSummary/UserSummary";

const useStyles = makeStyles(styles);

export default function UserAboutHeader(props) {
    const classes = useStyles();

    const {user, userData} = props;

    return (
        <div className={classes.body}>

            <div className={classNames(classes.card)}>
                <UserCard user={user} userData={userData}/>
            </div>

            <div className={classNames(classes.summary)}>
                <UserSummary/>
            </div>
        </div>
    );
}

UserAboutHeader.propTypes = {};
