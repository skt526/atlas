<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>

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
<%--@elvariable id="applicationProperties" type="uk.ac.ebi.atlas.web.ApplicationProperties"--%>
<%--@elvariable id="filterFactorsConverter" type="uk.ac.ebi.atlas.web.FilterFactorsConverter"--%>
<%--@elvariable id="preferences" type="uk.ac.ebi.atlas.web.ExperimentPageRequestPreferences"--%>

<c:set var="base" value="${pageContext.request.contextPath}"/>
<c:if test="${not empty preferences.rootContext}">
    <c:set var="base" value="${preferences.rootContext}"/>
</c:if>

<c:choose>
    <c:when test="${not empty baselineCounts}">
    <c:set var="resultsCount" value="${baselineCounts.size()}"/>

        <table id="baselineCountsTable">
            <tbody>
                <%--@elvariable id="baselineResult" type="uk.ac.ebi.atlas.search.baseline.BaselineExperimentAssayGroup"--%>
                <c:forEach var="baselineResult" items="${baselineCounts}">
                
                    <tr>
                        <td>
                            <a class="bioEntityCardLink"
                                   href="${base}/experiments/${baselineResult.experimentAccession}?_specific=on&queryFactorType=${baselineResult.defaultQueryFactorType}&queryFactorValues=${applicationProperties.encodeMultiValues(baselineResult.defaultFactorValuesForSpecificAssayGroupsWithCondition)}&geneQuery=${applicationProperties.urlParamEncode(param.geneQuery)}&exactMatch=${requestParameters.exactMatch}${baselineResult.filterFactors.isEmpty() ? "" : "&serializedFilterFactors=".concat(filterFactorsConverter.serialize(baselineResult.filterFactors))}"
                               title="experiment">
                                    ${baselineResult.species} - ${baselineResult.experimentName}${baselineResult.filterFactors.isEmpty() ? "" : " - ".concat(filterFactorsConverter.prettyPrint(baselineResult.filterFactors))}
                            </a>
                        </td>
                        <%-- We don't show counts for now --%>
                        <%--<c:if test="${empty param.geneQuery}">--%>
                            <%--<td class="count">--%>
                                <%--(${baselineResult.count})--%>
                            <%--</td>--%>
                        <%--</c:if>--%>
                    </tr>
                </c:forEach>
            </tbody>
        </table>

    </c:when>
    <c:otherwise>
        <%--<div>No baseline experiments were found.</div>--%>
    </c:otherwise>
</c:choose>
