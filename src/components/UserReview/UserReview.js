import React from "react";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";

import styles from "assets/jss/material-kit-react/components/userCard.js";
import classNames from "classnames";
import profile from "../../assets/img/faces/christian.jpg";

const useStyles = makeStyles(styles);

export default function UserReview(props) {
    const classes = useStyles();
    const {...rest} = props;
    const imageClasses = classNames(
        classes.imgBody,
        classes.imgRaised,
        classes.imgRoundedCircle,
        classes.imgFluid
    );

    return (
        <div className={classNames(classes.body)}>
            <div className={classNames(classes.profile)}>
                <img src={profile} alt="..." className={imageClasses}/>
            </div>
        </div>
    );
}

UserReview.propTypes = {};