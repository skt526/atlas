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
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div id="accordion">
    <ul>
        <img id="bioentity-info-image" title="Gene info" style="position: absolute; left: 0.5em; "
             src="resources/images/bioentity_info.png"/>
        <span class="geneCardSymbol">${symbol}</span>
        <span class="geneCardSpecies">${species}</span>
        <span class="geneCardDescription">${description}</span>
    </ul>

    <div>
        <p>Mauris mauris ante, blandit et, ultrices a, suscipit eget, quam. Integer ut neque. Vivamus nisi metus,
            molestie vel, gravida in, condimentum sit amet, nunc. Nam a nibh. Donec suscipit eros. Nam mi. Proin viverra
            leo ut odio. Curabitur malesuada. Vestibulum a velit eu ante scelerisque vulputate.</p>
    </div>
</div>

<script>
    $(function () {
        $("#bioentity-info-image").tooltip();

        $("#accordion").accordion({
            collapsible:true,
            heightStyle:"content",
            icons:{ "header":"geneCardIconPlus", "activeHeader":"geneCardIconMinus" },
            header:"ul"
        });
    });
</script>


