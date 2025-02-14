import React from "react";
// @material-ui/core components
import {makeStyles} from "@material-ui/core/styles";
import styles from "assets/jss/material-kit-react/components/userItem.js";
import CardProfileOrder from "../CardProfileOrder/CardProfileOrder";
import Button from "../CustomButtons/Button";
import {ListItem} from "@material-ui/core";
import classNames from "classnames";
import OfferActions from "../OfferActions/OfferActions";
import ItemDescriptionSmall from "../ItemDescription/ItemDescriptionSmall";

const dashboardRoutes = [];
const useStyles = makeStyles(styles);


export default function MentorForCustomerItem(props) {
    const classes = useStyles();
    const {mentor} = props;

    return (
        <div className={classNames(classes.main)}>

            <div className={classNames(classes.col_1)}>
                <CardProfileOrder/>
            </div>

            <div className={classNames(classes.col_2)}>
                <ItemDescriptionSmall type={false} id={mentor.id} title={mentor.fullName} desc={mentor.aboutUser}/>
            </div>

            <div className={classNames(classes.col_3)}>
                <OfferActions/>
            </div>
        </div>
    );
}

