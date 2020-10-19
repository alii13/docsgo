import React from 'react'
import { Breadcrumb } from 'antd';
import {Link} from "react-router-dom";
import { HomeOutlined, UserOutlined } from '@ant-design/icons';

function BreadCrumb(props) {
    const {name}=props;
    return (
        <Breadcrumb>
        <Link to ="/">
        <Breadcrumb.Item>
          <HomeOutlined />
          <span>Home</span>
        </Breadcrumb.Item>
        </Link>
        <Breadcrumb.Item>
          <UserOutlined />
          <span>{name}</span>
        </Breadcrumb.Item>
      </Breadcrumb>
    )
}

export default BreadCrumb
