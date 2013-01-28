<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/fmt" prefix="fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<%--
  ~ Copyright 2008-2013 Microarray Informatics Team, EMBL-European Bioinformatics Institute
  ~
  ~ Licensed under the Apache License, Version 2.0 (the "License");
  ~ you may not use this file except in compliance with the License.
  ~ You may obtain a copy of the License at
  ~
  ~ http://www.apache.org/licenses/LICENSE-2.0
  ~
  ~ Unless required by applicable law or agreed to in writing, software
  ~ distributed under the License is distributed on an "AS IS" BASIS,
  ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  ~ See the License for the specific language governing permissions and
  ~ limitations under the License.
  ~
  ~
  ~ For further details of the Gene Expression Atlas project, including source code,
  ~ downloads and documentation, please see:
  ~
  ~ http://gxa.github.com/gxa
  --%>


<c:if test="${defaultFilterFactorValuesSize > 1}">
    <td>
        <div data-help-loc="#filterBy" class="tooltip-div" title="">
            <c:choose>
                <c:when test="${not empty selectedFactorValues}">
                    <span>
                        <label>Filtered by</label>
                    </span>
                    <span class="filters-frame">
                        <c:forEach items="${selectedFactorValues}" var="factorValue">
                            <span class="filter-name">${factorValue.name}:</span>${factorValue.value}<br/>
                        </c:forEach>
                    </span>
                    <c:set var="filterMenuLabel" value="Change filters"/>
                </c:when>
                <c:otherwise>
                    <span>
                        <label>Filter by</label>
                    </span>
                    <c:set var="filterMenuLabel" value="Choose filters"/>
                </c:otherwise>
            </c:choose>
        </div>

        <span>
            <ul id="filterBy" style="display: none">
                <li><a>${filterMenuLabel}</a>
                    <ul>
                        <c:forEach items="${filterByMenu}" var="level1">
                            <li>
                                <a>${level1.key}</a>
                                <ul>
                                    <c:forEach items="${level1.value}" var="level2">
                                        <li>
                                            <a>${level2.key}</a>
                                            <ul>
                                                <c:forEach items="${level2.value}" var="level3">
                                                    <li>
                                                        <a>${level3.key}</a>
                                                        <ul>
                                                            <c:forEach items="${level3.value}" var="level4">
                                                                <li><a href="${level4.value}">${level4.key}</a></li>
                                                            </c:forEach>
                                                        </ul>
                                                    </li>
                                                </c:forEach>
                                            </ul>
                                        </li>
                                    </c:forEach>
                                </ul>
                            </li>
                        </c:forEach>
                    </ul>
                </li>
            </ul>
        </span>
    </td>
</c:if>


<script type="text/javascript">
    $(function () {
        $("#filterBy").menu();
        $("#filterBy").show();
    });

</script>
